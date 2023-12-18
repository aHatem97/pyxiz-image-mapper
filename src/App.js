import { Box } from "@mui/material";
import React, { useState, useEffect } from "react";

function App() {
  const [rectangles, setRectangles] = useState([]);
  const [resizingIndex, setResizingIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [ctrlKeyDown, setCtrlKeyDown] = useState(false);

  const handleClick = (e) => {
    if (resizingIndex === null && draggingIndex === null) {
      const newRectangle = {
        x: e.clientX - 100,
        y: e.clientY - 50,
        width: 200,
        height: 100,
      };

      setRectangles([...rectangles, newRectangle]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Control") {
      setCtrlKeyDown(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Control") {
      setCtrlKeyDown(false);
    }
  };

  const handleMouseDown = (e, index) => {
    e.stopPropagation();

    const rect = rectangles[index];
    const offsetX = e.clientX - rect.x;
    const offsetY = e.clientY - rect.y;

    if (e.target.classList.contains("border-handle")) {
      setResizingIndex(index);
    } else if (e.target.classList.contains("inner-rectangle")) {
      setDraggingIndex(index);
      setDragOffset({ x: offsetX, y: offsetY });
    } else if (e.target.parentElement.classList.contains("inner-rectangle")) {
      setDraggingIndex(index);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseUp = () => {
    setResizingIndex(null);
    setDraggingIndex(null);
  };

  const handleMouseMove = (e) => {
    if (resizingIndex !== null) {
      const updatedRectangles = rectangles.map((rect, index) => {
        if (index === resizingIndex) {
          const newWidth = e.clientX - rect.x;
          const newHeight = e.clientY - rect.y;
          return { ...rect, width: newWidth, height: newHeight };
        }
        return rect;
      });
      setRectangles(updatedRectangles);
    } else if (draggingIndex !== null) {
      const updatedRectangles = rectangles.map((rect, index) => {
        if (index === draggingIndex) {
          let newX, newY;
          if (ctrlKeyDown) {
            // Rotate the rectangle based on the mouse movement
            const centerX = rect.x + rect.width / 2;
            const centerY = rect.y + rect.height / 2;
            const angle =
              Math.atan2(e.clientY - centerY, e.clientX - centerX) *
              (180 / Math.PI);
            return { ...rect, rotate: angle };
          } else {
            newX = e.clientX - dragOffset.x;
            newY = e.clientY - dragOffset.y;
            return { ...rect, x: newX, y: newY };
          }
        }
        return rect;
      });
      setRectangles(updatedRectangles);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    };
  }, [resizingIndex, draggingIndex, ctrlKeyDown]);

  const Rectangle = ({ rectangle, index }) => {
    return (
      <div
        style={{
          position: "absolute",
          left: rectangle.x,
          top: rectangle.y,
          width: rectangle.width,
          height: rectangle.height,
          transform: `rotate(${rectangle.rotate}deg)`,
          cursor:
            index === resizingIndex
              ? "nwse-resize"
              : ctrlKeyDown
              ? "rotate"
              : "move",
        }}
        onMouseDown={(e) => handleMouseDown(e, index)}
      >
        <div
          className="border-handle"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            border: "2px solid red",
          }}
        >
          <div
            className="inner-rectangle"
            style={{
              position: "absolute",
              left: "2px",
              top: "2px",
              width: rectangle.width - 4,
              height: rectangle.height - 4,
              background: "transparent",
              cursor: "move",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Box sx={{ maxWidth: "100%" }}>
      <video
        muted
        playsInline
        preload="auto"
        style={{
          maxHeight: "90vh",
          zIndex: 0,
          width: "100%",
          objectFit: "cover",
        }}
        src="videos/airport.mp4"
        onClick={handleClick}
      ></video>

      {rectangles.map((rectangle, index) => (
        <Rectangle key={index} rectangle={rectangle} index={index} />
      ))}
    </Box>
  );
}

export default App;
