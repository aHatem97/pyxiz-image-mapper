import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [dynamicRectangles, setDynamicRectangles] = useState([]);
  const [staticRectangles, setStaticRectangles] = useState([]);
  const [rectangleType, setRectangleType] = useState(null);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [duration, setDuration] = useState(0);
  const [newRectangle, setNewRectangle] = useState(null);

  const handleClick = (e) => {
    if (resizingIndex === null && draggingIndex === null) {
      setOpenTypeDialog(true);
      setNewRectangle({
        x: e.clientX - 100,
        y: e.clientY - 50,
        width: 200,
        height: 100,
      });
    }
  };

  const handleRectangleType = () => {
    const rectangle = { ...newRectangle };
    if (rectangleType === "dynamic") {
      rectangle.time = currentTime;
      rectangle.duration = parseInt(duration);
      rectangle.type = rectangleType;
    }
    rectangle.url = editUrl;
    setRectangles([...rectangles, rectangle]);
    setRectangleType("");
    handleCloseDialog();
  };

  const handleEdit = (index) => {
    setSelectedIndex(index);
    setOpenEditDialog(true);
  };

  const handleCloseDialog = () => {
    setRectangleType("");
    setOpenEditDialog(false);
    setOpenTypeDialog(false);
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

    // Save the enabled rectangles state in local storage
    localStorage.setItem(
      "disabledRectangles",
      JSON.stringify(updatedDisabledRectangles)
    );
  };

  useEffect(() => {
    const savedRectanglesJSON = localStorage.getItem("savedRectangles");
    const savedRectangles = JSON.parse(savedRectanglesJSON);

    console.log("savedRectangles: ", savedRectangles);
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
    document.body.style.cursor = "auto";
  };

  const handleMouseMove = (e) => {
    if (resizingIndex !== null) {
      const newWidth = e.clientX - rectangles[resizingIndex].x;
      const newHeight = e.clientY - rectangles[resizingIndex].y;

      const videoElement = document.getElementById("video");
      const videoRect = videoElement.getBoundingClientRect();
      const maxWidth = videoRect.right - rectangles[resizingIndex].x;
      const maxHeight = videoRect.bottom - rectangles[resizingIndex].y;

      const constrainedWidth = Math.min(newWidth, maxWidth);
      const constrainedHeight = Math.min(newHeight, maxHeight);

      const updatedRectangles = rectangles.map((rect, index) =>
        index === resizingIndex
          ? { ...rect, width: constrainedWidth, height: constrainedHeight }
          : rect
      );

      setRectangles(updatedRectangles);
    } else if (draggingIndex !== null) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const videoElement = document.getElementById("video");
      const videoRect = videoElement.getBoundingClientRect();

      const constrainedX = Math.max(videoRect.left, newX);
      const constrainedY = Math.max(videoRect.top, newY);
      const maxWidth = videoRect.right - rectangles[draggingIndex].width;
      const maxHeight = videoRect.bottom - rectangles[draggingIndex].height;

      const finalX = Math.min(constrainedX, maxWidth);
      const finalY = Math.min(constrainedY, maxHeight);

      const updatedRectangles = rectangles.map((rect, index) =>
        index === draggingIndex ? { ...rect, x: finalX, y: finalY } : rect
      );

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
    const videoRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const rotationStyle = rectangle.rotate
      ? `rotate(${rectangle.rotate}deg)`
      : "";

    const getCurrentTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current);
        return videoRef.current.currentTime;
      }
      return 0;
    };

    useEffect(() => {
      getCurrentTime();
      if (rectangle.type !== "dynamic") {
        setIsVisible(true); // Show static rectangles by default
        return;
      }

      const timer = setInterval(() => {
        const endTime = rectangle.time + rectangle.duration;

        if (currentTime >= rectangle.time && currentTime <= endTime) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 100);

      return () => clearInterval(timer);
    }, [rectangle]);

    const handleSave = (index) => {
      const updatedRectangles = rectangles.map((rect, i) => {
        if (i === index) {
          const updatedSavedRectangles = { ...savedRectangles };

          // Preserve the index of the rectangle in the savedRectangles object
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
          display: isVisible ? "block" : "none",
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
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <video
          id="video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            maxHeight: "90vh",
            zIndex: 0,
            maxWidth: "100%",
          }}
          src="videos/video1.m4v"
          onClick={handleClick}
        ></video>
      </Box>

      {rectangles.map((rectangle, index) => (
        <Rectangle key={index} rectangle={rectangle} index={index} />
      ))}
      {openEditDialog && (
        <>
          <Box
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
            onClick={handleCloseDialog}
          />
          <Dialog open={openEditDialog} onClose={handleCloseDialog}>
            <DialogTitle sx={{ margin: "0 auto" }}>Edit URL</DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
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
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: "2em" }}
            >
              <TextField
                label="URL"
                fullWidth
                defaultValue={savedRectangles[selectedIndex]?.url}
                onChange={(event) => setEditUrl(event.target.value)}
                sx={{ marginTop: "1em" }}
              />
              {savedRectangles[selectedIndex]?.type === "dynamic" && (
                <TextField
                  label="Duration"
                  type="number"
                  fullWidth
                  defaultValue={savedRectangles[selectedIndex]?.duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              )}
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
        </>
      )}
      {openTypeDialog && (
        <>
          <Box
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
            onClick={handleCloseDialog}
          ></Box>
          <Dialog open={openTypeDialog} onClose={handleCloseDialog}>
            <DialogTitle
              sx={{ margin: "0 auto", fontWeight: "700", fontSize: "28px" }}
            >
              {rectangleType === "dynamic"
                ? "Create Your Dynamic Rectangle"
                : rectangleType === "static"
                ? "Create Your Static Rectangle"
                : "Select Rectangle Type"}
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1em",
                p: "0 2em",
                flexDirection: rectangleType ? "column" : "row",
              }}
            >
              {rectangleType !== "static" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em",
                    flex: 1,
                    marginBottom: "auto",
                    maxWidth: "300px",
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={rectangleType === "dynamic"}
                    onClick={() => setRectangleType("dynamic")}
                  >
                    Dynamic
                  </Button>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#A4A4A4",
                      textAlign: "center",
                    }}
                  >
                    Dynamic rectangles are given a duration in which they will
                    be available since creation time.
                  </Typography>
                </Box>
              )}

              {rectangleType !== "dynamic" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em",
                    flex: 1,
                    marginBottom: "auto",
                    maxWidth: "300px",
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={rectangleType === "static"}
                    onClick={() => setRectangleType("static")}
                  >
                    Static
                  </Button>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#A4A4A4",
                      textAlign: "center",
                    }}
                  >
                    Static rectangles are available throughout the whole video.
                  </Typography>
                </Box>
              )}
              {rectangleType && (
                <TextField
                  label="URL"
                  size="small"
                  placeholder="Enter URL here..."
                  onChange={(event) => setEditUrl(event.target.value)}
                />
              )}
              {rectangleType === "dynamic" && (
                <TextField
                  label="Duration"
                  type="number"
                  size="small"
                  placeholder="0"
                  onChange={(e) => setDuration(e.target.value)}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              {rectangleType && (
                <Button onClick={handleRectangleType}>Create</Button>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

export default App;
