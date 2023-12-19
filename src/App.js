import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  OpenWith,
  Height,
  RotateLeft,
  Save,
  Delete,
  EditNote,
  Close,
  Preview,
  Construction,
} from "@mui/icons-material";

function App() {
  const [rectangles, setRectangles] = useState([]);
  const [resizingIndex, setResizingIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotateIndex, setRotateIndex] = useState(null);
  const [rotateOffset, setRotateOffset] = useState({ x: 0, y: 0 });
  const [savedRectangles, setSavedRectangles] = useState([]);
  const [disabledRectangles, setDisabledRectangles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

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

  const handleEdit = (index) => {
    setSelectedIndex(index);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSaveUrl = (index) => {
    const updatedRectangles = rectangles.map((rect, i) => {
      if (i === index) {
        rect.url = editUrl;
      }

      return rect;
    });

    setRectangles(updatedRectangles);
    setOpenEditDialog(false);

    // Save the updated rectangles array to localStorage
    localStorage.setItem("savedRectangles", JSON.stringify(updatedRectangles));
  };

  const handleEnterViewMode = () => {
    const updatedDisabledRectangles = rectangles.map((_, index) => index);
    setDisabledRectangles(updatedDisabledRectangles);
    setEditMode(false);

    // Save the disabled rectangles state in local storage
    localStorage.setItem(
      "disabledRectangles",
      JSON.stringify(updatedDisabledRectangles)
    );
  };

  const handleEnterEditMode = () => {
    const updatedDisabledRectangles = disabledRectangles.filter(
      (index) => !rectangles[index]
    );
    setDisabledRectangles(updatedDisabledRectangles);
    setEditMode(true);

    // Save the enabled rectangles state in local storage
    localStorage.setItem(
      "disabledRectangles",
      JSON.stringify(updatedDisabledRectangles)
    );
  };

  useEffect(() => {
    const savedRectanglesJSON = localStorage.getItem("savedRectangles");
    const savedRectangles = JSON.parse(savedRectanglesJSON);

    const disabledRectanglesJSON = localStorage.getItem("disabledRectangles");
    const disabledRectangles = JSON.parse(disabledRectanglesJSON);

    if (savedRectangles) {
      // Convert savedRectangles from object to array of rectangles
      const updatedRectangles = Object.values(savedRectangles);
      setRectangles(updatedRectangles);
      setSavedRectangles(savedRectangles);
    }

    if (disabledRectangles) {
      setDisabledRectangles(disabledRectangles);
    }
  }, []);

  const isDisabled = (index) => {
    return disabledRectangles.includes(index);
  };

  const handleMouseDown = (e, index, action) => {
    e.stopPropagation();

    if (action === "resize") {
      setResizingIndex(index);
    } else if (action === "reposition") {
      setDraggingIndex(index);
      const offsetX = e.clientX - rectangles[index].x;
      const offsetY = e.clientY - rectangles[index].y;
      setDragOffset({ x: offsetX, y: offsetY });
    } else if (action === "rotate") {
      setRotateIndex(index);
      setRotateOffset({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }
  };

  const handleMouseUp = () => {
    setResizingIndex(null);
    setDraggingIndex(null);
    setRotateIndex(null);
    document.body.style.cursor = "auto"; // Set cursor style back to default
  };

  const handleMouseMove = (e) => {
    if (resizingIndex !== null) {
      const updatedRectangles = rectangles.map((rect, index) => {
        if (index === resizingIndex) {
          if (rect.rotate !== undefined) {
            // Rectangle is rotated
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const dx = mouseX - (rect.x + rect.width / 2);
            const dy = mouseY - (rect.y + rect.height / 2);

            const rotation = (rect.rotate * Math.PI) / 180;

            const newWidth =
              (dx * Math.cos(rotation) + dy * Math.sin(rotation)) * 2;
            const newHeight =
              (-dx * Math.sin(rotation) + dy * Math.cos(rotation)) * 2;

            return { ...rect, width: newWidth, height: newHeight };
          } else {
            // Rectangle is not rotated
            const newWidth = e.clientX - rect.x;
            const newHeight = e.clientY - rect.y;

            return { ...rect, width: newWidth, height: newHeight };
          }
        }
        return rect;
      });

      setRectangles(updatedRectangles);
    } else if (draggingIndex !== null) {
      const updatedRectangles = rectangles.map((rect, index) => {
        if (index === draggingIndex) {
          let newX, newY;
          newX = e.clientX - dragOffset.x;
          newY = e.clientY - dragOffset.y;
          return { ...rect, x: newX, y: newY };
        }
        return rect;
      });
      setRectangles(updatedRectangles);
    } else if (rotateIndex !== null) {
      const updatedRectangles = rectangles.map((rect, index) => {
        if (index === rotateIndex) {
          const dx = e.clientX - (rect.x + rect.width / 2) - rotateOffset.x;
          const dy = e.clientY - (rect.y + rect.height / 2) - rotateOffset.y;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return { ...rect, rotate: angle };
        }
        return rect;
      });
      setRectangles(updatedRectangles);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [resizingIndex, draggingIndex, rotateIndex]);

  const Rectangle = ({ rectangle, index }) => {
    const rotationStyle = rectangle.rotate
      ? `rotate(${rectangle.rotate}deg)`
      : "";

    const handleSave = (index) => {
      const updatedRectangles = rectangles.map((rect, i) => {
        if (i === index) {
          const updatedSavedRectangles = { ...savedRectangles };

          // Preserve the index of the rectangle in the savedRectangles object
          updatedSavedRectangles[index] = rect;

          setSavedRectangles(updatedSavedRectangles);
          setDisabledRectangles([...disabledRectangles, index]);
          localStorage.setItem(
            "savedRectangles",
            JSON.stringify(updatedSavedRectangles)
          );

          // Save the disabledRectangles state in local storage
          localStorage.setItem(
            "disabledRectangles",
            JSON.stringify([...disabledRectangles, index])
          );
        }
        return rect;
      });

      setRectangles(updatedRectangles);
    };

    const handleDelete = (index) => {
      const updatedRectangles = rectangles.filter((_, i) => i !== index);
      setRectangles(updatedRectangles);
      setSavedRectangles(updatedRectangles);
      localStorage.setItem(
        "savedRectangles",
        JSON.stringify(updatedRectangles)
      );
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
              cursor: "grab",
              display: isDisabled(index) ? "none" : "flex",
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
          <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
            <DialogTitle sx={{ margin: "0 auto" }}>Edit URL</DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleCloseEditDialog}
              sx={{
                position: "absolute",
                right: "8px",
                top: "8px",
                transition: "0.5s all",
                "&:hover": {
                  transform: "scale(1.2)",
                  color: "red",
                },
              }}
            >
              <Close />
            </IconButton>
            <DialogContent>
              <TextField
                label="URL"
                required
                fullWidth
                defaultValue={savedRectangles[selectedIndex]?.url}
                onChange={(event) => setEditUrl(event.target.value)}
                sx={{ marginTop: "1em" }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleSaveUrl(selectedIndex)}
                sx={{ margin: "0 auto" }}
              >
                Save URL
              </Button>
            </DialogActions>
          </Dialog>
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
            onClick={() => handleDelete(index)}
          >
            <Delete />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "10px",
        }}
      >
        <Button onClick={handleEnterViewMode}>
          Enter View Mode <Preview />
        </Button>
        <Button onClick={handleEnterEditMode}>
          Enter Edit Mode <Construction />
        </Button>
      </Box>
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
      {openEditDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
          onClick={handleCloseEditDialog}
        ></div>
      )}
    </Box>
  );
}

export default App;
