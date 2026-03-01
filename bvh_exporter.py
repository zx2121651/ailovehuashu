import numpy as np
from scipy.spatial.transform import Rotation as R

class BVHExporter:
    """
    将 MediaPipe Pose 的 33 个 3D 关键点序列转换为标准的 BVH 骨骼动画文件。
    这是一个简化的映射模型，主要将手臂、腿部、脊柱、头部的运动向量映射为欧拉角。
    """
    def __init__(self):
        # 定义 BVH 的骨架层级和静态 T-Pose 偏移量 (Offsets)
        # 这里定义一个极其简化的二足类人骨架以兼容大多数引擎的基础导入
        self.hierarchy = """HIERARCHY
ROOT Hips
{
  OFFSET 0.0 0.0 0.0
  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
  JOINT Spine
  {
    OFFSET 0.0 10.0 0.0
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT Neck
    {
      OFFSET 0.0 15.0 0.0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT Head
      {
        OFFSET 0.0 8.0 0.0
        CHANNELS 3 Zrotation Xrotation Yrotation
        End Site
        {
          OFFSET 0.0 10.0 0.0
        }
      }
    }
    JOINT LeftShoulder
    {
      OFFSET 15.0 12.0 0.0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT LeftArm
      {
        OFFSET 15.0 0.0 0.0
        CHANNELS 3 Zrotation Xrotation Yrotation
        JOINT LeftForeArm
        {
          OFFSET 20.0 0.0 0.0
          CHANNELS 3 Zrotation Xrotation Yrotation
          JOINT LeftHand
          {
            OFFSET 20.0 0.0 0.0
            CHANNELS 3 Zrotation Xrotation Yrotation
            End Site
            {
              OFFSET 10.0 0.0 0.0
            }
          }
        }
      }
    }
    JOINT RightShoulder
    {
      OFFSET -15.0 12.0 0.0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT RightArm
      {
        OFFSET -15.0 0.0 0.0
        CHANNELS 3 Zrotation Xrotation Yrotation
        JOINT RightForeArm
        {
          OFFSET -20.0 0.0 0.0
          CHANNELS 3 Zrotation Xrotation Yrotation
          JOINT RightHand
          {
            OFFSET -20.0 0.0 0.0
            CHANNELS 3 Zrotation Xrotation Yrotation
            End Site
            {
              OFFSET -10.0 0.0 0.0
            }
          }
        }
      }
    }
  }
  JOINT LeftUpLeg
  {
    OFFSET 8.0 -5.0 0.0
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT LeftLeg
    {
      OFFSET 0.0 -35.0 0.0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT LeftFoot
      {
        OFFSET 0.0 -35.0 0.0
        CHANNELS 3 Zrotation Xrotation Yrotation
        End Site
        {
          OFFSET 0.0 -10.0 15.0
        }
      }
    }
  }
  JOINT RightUpLeg
  {
    OFFSET -8.0 -5.0 0.0
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT RightLeg
    {
      OFFSET 0.0 -35.0 0.0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT RightFoot
      {
        OFFSET 0.0 -35.0 0.0
        CHANNELS 3 Zrotation Xrotation Yrotation
        End Site
        {
          OFFSET 0.0 -10.0 15.0
        }
      }
    }
  }
}
"""
        # 注意：MediaPipe的坐标系：x向右，y向下，z向前（距离越小越靠近镜头）。
        # BVH常用坐标系：x向右，y向上，z向外。所以我们在计算前要做一定的坐标转换。

    def _mp_to_bvh_vector(self, p1, p2):
        """将 MediaPipe 的两个关键点转为一个从 p1 指向 p2 的三维向量，并映射到 Y向上 的空间"""
        # mp: x=right, y=down, z=closer/negative
        # target: x=left/right, y=up, z=forward
        # 为了不纠结复杂的全身绝对映射，我们使用相对位移，并取反 Y 使其向上。
        v = np.array([
            -(p2['x'] - p1['x']),
            -(p2['y'] - p1['y']),
            -(p2['z'] - p1['z'])
        ])
        norm = np.linalg.norm(v)
        if norm < 1e-6:
            return np.array([0, -1, 0]) # 默认向下
        return v / norm

    def _vec_to_euler(self, v, default_axis):
        """利用旋转计算一个方向向量相较于它的默认 T-pose 朝向的欧拉角 (ZXY 顺序)"""
        # 这是一个极度简化的 IK 几何推导，真实的 IK 会建立切线平面和 Up-vector。
        # 这里使用 scipy 求两向量之间的最短旋转矩阵
        axis = np.cross(default_axis, v)
        sin_theta = np.linalg.norm(axis)
        cos_theta = np.dot(default_axis, v)

        if sin_theta < 1e-6:
            return [0.0, 0.0, 0.0]

        axis = axis / sin_theta
        theta = np.arctan2(sin_theta, cos_theta)

        rot_vec = axis * theta
        r = R.from_rotvec(rot_vec)
        # Z X Y 顺序欧拉角（度）
        euler = r.as_euler('zxy', degrees=True)
        return euler

    def convert_pose_frames_to_bvh(self, frames_data, fps=30.0):
        """
        frames_data: List of pose_landmarks dictionaries.
        格式： [{'x':..., 'y':..., 'z':...}, ...] (length=33)
        """
        motion_header = f"MOTION\nFrames: {len(frames_data)}\nFrame Time: {1.0/fps:.5f}\n"

        bvh_frames = []
        for pose in frames_data:
            if not pose or len(pose) < 33:
                # 丢失追踪的帧补零
                bvh_frames.append(" ".join(["0.00"] * 51))
                continue

            # MediaPipe Pose keypoints (subset):
            # 0: nose, 11: left_shoulder, 12: right_shoulder
            # 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist
            # 23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee, 27: left_ankle, 28: right_ankle

            # 1. 根节点位置 (Hips) -> 取左右髋的中心点，并放大比例
            root_x = -((pose[23]['x'] + pose[24]['x']) / 2.0 - 0.5) * 100
            root_y = -((pose[23]['y'] + pose[24]['y']) / 2.0 - 0.5) * 100 + 100 # 抬高
            root_z = -((pose[23]['z'] + pose[24]['z']) / 2.0) * 100
            root_pos = [root_x, root_y, root_z]

            frame_angles = []

            # Hips Rot (0,0,0) - 简化，不计算全身倾斜
            frame_angles.extend([0.0, 0.0, 0.0])
            # Spine Rot
            frame_angles.extend([0.0, 0.0, 0.0])
            # Neck Rot
            frame_angles.extend([0.0, 0.0, 0.0])
            # Head Rot
            frame_angles.extend([0.0, 0.0, 0.0])
            # LeftShoulder
            frame_angles.extend([0.0, 0.0, 0.0])

            # LeftArm (Shoulder to Elbow) - 默认朝向 (1, 0, 0) 右方(在屏幕上是左边)
            vec_l_arm = self._mp_to_bvh_vector(pose[11], pose[13])
            rot_l_arm = self._vec_to_euler(vec_l_arm, np.array([1, 0, 0]))
            frame_angles.extend(rot_l_arm)

            # LeftForeArm (Elbow to Wrist)
            vec_l_fore = self._mp_to_bvh_vector(pose[13], pose[15])
            rot_l_fore = self._vec_to_euler(vec_l_fore, np.array([1, 0, 0]))
            frame_angles.extend(rot_l_fore)

            # LeftHand
            frame_angles.extend([0.0, 0.0, 0.0])

            # RightShoulder
            frame_angles.extend([0.0, 0.0, 0.0])

            # RightArm (Shoulder to Elbow) - 默认朝向 (-1, 0, 0)
            vec_r_arm = self._mp_to_bvh_vector(pose[12], pose[14])
            rot_r_arm = self._vec_to_euler(vec_r_arm, np.array([-1, 0, 0]))
            frame_angles.extend(rot_r_arm)

            # RightForeArm
            vec_r_fore = self._mp_to_bvh_vector(pose[14], pose[16])
            rot_r_fore = self._vec_to_euler(vec_r_fore, np.array([-1, 0, 0]))
            frame_angles.extend(rot_r_fore)

            # RightHand
            frame_angles.extend([0.0, 0.0, 0.0])

            # LeftUpLeg (Hip to Knee) - 默认朝向 (0, -1, 0)
            vec_l_leg = self._mp_to_bvh_vector(pose[23], pose[25])
            rot_l_leg = self._vec_to_euler(vec_l_leg, np.array([0, -1, 0]))
            frame_angles.extend(rot_l_leg)

            # LeftLeg (Knee to Ankle)
            vec_l_knee = self._mp_to_bvh_vector(pose[25], pose[27])
            rot_l_knee = self._vec_to_euler(vec_l_knee, np.array([0, -1, 0]))
            frame_angles.extend(rot_l_knee)

            # LeftFoot
            frame_angles.extend([0.0, 0.0, 0.0])

            # RightUpLeg
            vec_r_leg = self._mp_to_bvh_vector(pose[24], pose[26])
            rot_r_leg = self._vec_to_euler(vec_r_leg, np.array([0, -1, 0]))
            frame_angles.extend(rot_r_leg)

            # RightLeg
            vec_r_knee = self._mp_to_bvh_vector(pose[26], pose[28])
            rot_r_knee = self._vec_to_euler(vec_r_knee, np.array([0, -1, 0]))
            frame_angles.extend(rot_r_knee)

            # RightFoot
            frame_angles.extend([0.0, 0.0, 0.0])

            # 组合 Root Pos + All Rotations
            frame_row = root_pos + list(frame_angles)
            bvh_frames.append(" ".join([f"{v:.4f}" for v in frame_row]))

        return self.hierarchy + motion_header + "\n".join(bvh_frames)
