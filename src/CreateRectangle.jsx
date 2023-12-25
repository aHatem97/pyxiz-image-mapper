import { Box, IconButton } from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  OpenWith,
  Height,
  RotateLeft,
  Save,
  Delete,
  EditNote,
} from "@mui/icons-material";

const CreateRectangle = ({
  rectangle,
  index,
  currentTime,
  rectangles,
  savedRectangles,
  setSavedRectangles,
  setDisabledRectangles,
  disabledRectangles,
  rectangleType,
  setRectangles,
  handleMouseDown,
  isDisabled,
  handleEdit,
  isEditMode,
  setOpenConfirmDialog,
  setSelectedIndex,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [dynamicRectangles, setDynamicRectangles] = useState([]);
  const [staticRectangles, setStaticRectangles] = useState([]);
  const rotationStyle = rectangle.rotate
    ? `rotate(${rectangle.rotate}deg)`
    : "";

  useEffect(() => {
    if (rectangle.type !== "dynamic") {
      setIsVisible(true);
      return;
    }

    const endTime = rectangle.time + rectangle.duration;
    const currentTimeInRange =
      currentTime >= rectangle.time && currentTime <= endTime;
    setIsVisible(currentTimeInRange);
  }, [rectangle, currentTime]);

  const handleSave = (index) => {
    const updatedRectangles = rectangles.map((rect, i) => {
      if (i === index) {
        const updatedSavedRectangles = { ...savedRectangles };

        updatedSavedRectangles[index] = rect;

        setSavedRectangles(updatedSavedRectangles);
        setDisabledRectangles([...disabledRectangles, index]);

        if (rectangleType === "dynamic") {
          setDynamicRectangles([...dynamicRectangles, rect]);
        } else if (rectangleType === "static") {
          setStaticRectangles([...staticRectangles, rect]);
        }

        localStorage.setItem(
          "savedRectangles",
          JSON.stringify(updatedSavedRectangles)
        );

        localStorage.setItem(
          "disabledRectangles",
          JSON.stringify([...disabledRectangles, index])
        );
      }
      return rect;
    });

    setRectangles(updatedRectangles);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: rectangle.x,
        top: rectangle.y,
        width: rectangle.width,
        height: rectangle.height,
        transform: rotationStyle,
        display: isEditMode ? "block" : isVisible ? "block" : "none",
      }}
      onMouseDown={(e) => handleMouseDown(e, index)}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          border: isDisabled(index) ? "none" : "2px solid red",
          cursor: isDisabled(index) ? "pointer" : "auto",
          transition: "0.5s all",
          backgroundColor: "red",
          "&:hover": {
            backgroundColor: isDisabled(index) ? "red" : "transparent",
          },
        }}
        onClick={() =>
          isDisabled(index)
            ? window.open(savedRectangles[index]?.url, "_blank")
            : ""
        }
      >
        <Box
          sx={{
            position: "absolute",
            left: "2px",
            top: "2px",
            width: rectangle.width - 4,
            height: rectangle.height - 4,
            background: "transparent",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontSize: "30px",
              cursor: "move",
              display: isDisabled(index) ? "none" : "flex",
            }}
            onMouseDown={(e) => handleMouseDown(e, index, "reposition")}
          >
            <OpenWith />
          </IconButton>
        </Box>
        <IconButton
          sx={{
            position: "absolute",
            top: "100%",
            left: "100%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            color: "white",
            fontSize: "30px",
            cursor: "se-resize",
            display: isDisabled(index) ? "none" : "flex",
            overflow: "hidden",
            p: 0,
          }}
          onMouseDown={(e) => handleMouseDown(e, index, "resize")}
        >
          <Height />
        </IconButton>
        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "30px",
            cursor: "grab",
            display: isDisabled(index) ? "none" : "flex",
            overflow: "hidden",
            p: 0,
          }}
          onMouseDown={(e) => handleMouseDown(e, index, "rotate")}
        >
          <RotateLeft />
        </IconButton>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "-45px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.5em",
        }}
      >
        <IconButton
          sx={{
            width: "35px",
            height: "35px",
            color: "white",
            fontSize: "16px",
            backgroundColor: "primary.main",
            transition: "0.5s all",
            "&:hover": {
              backgroundColor: "white",
              color: "primary.main",
            },
            display: isDisabled(index) ? "none" : "flex",
          }}
          onClick={() => handleEdit(index)}
        >
          <EditNote />
        </IconButton>
        <IconButton
          variant="contained"
          size="small"
          sx={{
            width: "35px",
            height: "35px",
            color: "white",
            fontSize: "16px",
            backgroundColor: "primary.main",
            transition: "0.5s all",
            "&:hover": {
              backgroundColor: "white",
              color: "success.main",
            },
            display: isDisabled(index) ? "none" : "flex",
          }}
          onClick={() => handleSave(index)}
        >
          <Save />
        </IconButton>
        <IconButton
          sx={{
            width: "35px",
            height: "35px",
            color: "white",
            fontSize: "30px",
            backgroundColor: "error.main",
            transition: "0.5s all",
            "&:hover": {
              backgroundColor: "white",
              color: "error.main",
            },
            display: isDisabled(index) ? "none" : "flex",
          }}
          onClick={() => {
            setOpenConfirmDialog(true);
            setSelectedIndex(index);
          }}
        >
          <Delete />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CreateRectangle;
