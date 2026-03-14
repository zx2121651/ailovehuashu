import React, { useRef, useState } from 'react';

export default function ScrollableRow({ children, className }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragged, setIsDragged] = useState(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    setIsDragged(false);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const handleMouseLeave = () => { isDragging.current = false; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) setIsDragged(true);
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // 阻止拖拽结束时触发点击事件
  const handleClickCapture = (e) => {
    if (isDragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {children}
    </div>
  );
}
