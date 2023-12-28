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
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Close,
  Preview,
  Construction,
  AccessTime,
  Pause,
  PlayArrow,
} from "@mui/icons-material";

import CreateRectangle from "./CreateRectangle";

function App() {
  const [rectangles, setRectangles] = useState([]);
  const [resizingIndex, setResizingIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotateIndex, setRotateIndex] = useState(null);
  const [savedRectangles, setSavedRectangles] = useState([]);
  const [disabledRectangles, setDisabledRectangles] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [rectangleType, setRectangleType] = useState(null);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [duration, setDuration] = useState(0);
  const [newRectangle, setNewRectangle] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef(null);

  const handleClick = (e) => {
    if (resizingIndex === null && draggingIndex === null) {
      setOpenTypeDialog(true);
      videoRef.current.pause();

      const containerRect = videoRef.current.parentNode.getBoundingClientRect();

      const containerX = containerRect.left;
      const containerY = containerRect.top;

      const clickX = e.clientX - containerX;
      const clickY = e.clientY - containerY;

      const parentWidth = containerRect.width;
      const parentHeight = containerRect.height;

      const widthPercent = 10;
      const heightPercent = 5;

      const xPercent = Math.round(
        (clickX / parentWidth) * 100 - widthPercent / 2
      );
      const yPercent = Math.round(
        (clickY / parentHeight) * 100 - heightPercent / 2
      );

      setNewRectangle({
        x: `${xPercent}%`,
        y: `${yPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      });
    }
  };

  const handleRectangleType = () => {
    const rectangle = { ...newRectangle };
    if (rectangleType === "dynamic") {
      rectangle.time = currentTime;
      rectangle.duration = parseInt(duration);
    }
    rectangle.type = rectangleType;
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
    setOpenConfirmDialog(false);
    videoRef.current.play();
  };

  const handleSaveUrl = (index) => {
    const updatedRectangles = rectangles.map((rect, i) => {
      if (i === index) {
        rect.url = editUrl;
        rect.duration = parseInt(duration);
      }

      return rect;
    });

    setRectangles(updatedRectangles);
    setOpenEditDialog(false);

    localStorage.setItem("savedRectangles", JSON.stringify(updatedRectangles));
  };

  const handleEnterViewMode = () => {
    setIsEditMode(false);
    const updatedDisabledRectangles = rectangles.map((_, index) => index);

    if (videoRef && videoRef.current) {
      videoRef.current.play();
    }

    setDisabledRectangles(updatedDisabledRectangles);

    localStorage.setItem(
      "disabledRectangles",
      JSON.stringify(updatedDisabledRectangles)
    );
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    const updatedDisabledRectangles = disabledRectangles.filter(
      (index) => !rectangles[index]
    );

    if (videoRef && videoRef.current) {
      videoRef.current.pause();
    }

    setDisabledRectangles(updatedDisabledRectangles);

    localStorage.setItem(
      "disabledRectangles",
      JSON.stringify(updatedDisabledRectangles)
    );
  };

  const updateCurrentTime = useCallback(() => {
    const videoElement = videoRef.current;
    setCurrentTime(videoElement.currentTime);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastCall = 0;
    const delay = 100; // Set the throttling delay in milliseconds

    const animate = (timestamp) => {
      if (timestamp - lastCall >= delay) {
        updateCurrentTime();
        lastCall = timestamp;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateCurrentTime]);

  useEffect(() => {
    const videoElement = videoRef.current;
    videoElement.addEventListener("timeupdate", updateCurrentTime);

    return () => {
      videoElement.removeEventListener("timeupdate", updateCurrentTime);
    };
  });

  useEffect(() => {
    const savedRectanglesJSON = localStorage.getItem("savedRectangles");
    const savedRectangles = JSON.parse(savedRectanglesJSON);
    console.log("savedRectangles: ", savedRectangles);
    const disabledRectanglesJSON = localStorage.getItem("disabledRectangles");
    const disabledRectangles = JSON.parse(disabledRectanglesJSON);

    if (savedRectangles) {
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
      const videoRect = videoRef.current.getBoundingClientRect(); // Get the position and dimensions of the video element

      // Calculate the offsetX relative to the video element
      const offsetX = ((e.clientX - videoRect.left) / videoRect.width) * 100;
      const offsetY = ((e.clientY - videoRect.top) / videoRect.height) * 100;
      setDragOffset({ x: offsetX, y: offsetY });
    } else if (action === "rotate") {
      setRotateIndex(index);
    }
  };

  const handleMouseUp = () => {
    setResizingIndex(null);
    setDraggingIndex(null);
    setRotateIndex(null);
    document.body.style.cursor = "auto";
  };

  const handleMouseMove = (e) => {
    const minimumWidth = 60;
    const minimumHeight = 40;
    const videoElement = document.getElementById("video");
    const videoRect = videoElement.getBoundingClientRect();

    if (resizingIndex !== null) {
      const containerRect = videoRef.current.parentNode.getBoundingClientRect();
      const containerX = containerRect.left;
      const containerY = containerRect.top;

      const clickX = e.clientX - containerX;
      const clickY = e.clientY - containerY;

      const parentWidth = containerRect.width;
      const parentHeight = containerRect.height;

      const startX =
        (Number(rectangles[resizingIndex].x.replace("%", "")) * parentWidth) /
        100;
      const startY =
        (Number(rectangles[resizingIndex].y.replace("%", "")) * parentHeight) /
        100;

      const newWidth = clickX - startX;
      const newHeight = clickY - startY;

      const maxWidth = parentWidth - startX;
      const maxHeight = parentHeight - startY;

      const constrainedWidth = Math.max(newWidth, minimumWidth);
      const constrainedHeight = Math.max(newHeight, minimumHeight);

      const finalWidth = Math.min(constrainedWidth, maxWidth);
      const finalHeight = Math.min(constrainedHeight, maxHeight);

      const updatedRectangles = rectangles.map((rect, index) =>
        index === resizingIndex
          ? {
              ...rect,
              width: `${(finalWidth * 100) / parentWidth}%`,
              height: `${(finalHeight * 100) / parentHeight}%`,
            }
          : rect
      );

      setRectangles(updatedRectangles);
    } else if (draggingIndex !== null) {
      const newX = e.clientX - videoRect.left - dragOffset.x;
      const newY = e.clientY - videoRect.top - dragOffset.y;

      const constrainedX = Math.max(0, newX);
      const constrainedY = Math.max(0, newY);

      const maxWidth =
        videoRect.width -
        3 -
        (Number(rectangles[draggingIndex].width.replace("%", "")) *
          videoRect.width) /
          100;
      const maxHeight =
        videoRect.height -
        4 -
        (Number(rectangles[draggingIndex].height.replace("%", "")) *
          videoRect.height) /
          100;

      const finalX = Math.min(constrainedX, maxWidth);
      const finalY = Math.min(constrainedY, maxHeight);

      const updatedRectangles = rectangles.map((rect, index) =>
        index === draggingIndex
          ? {
              ...rect,
              x: `${(finalX / videoRef.current.parentNode.offsetWidth) * 100}%`,
              y: `${
                (finalY / videoRef.current.parentNode.offsetHeight) * 100
              }%`,
            }
          : rect
      );

      setRectangles(updatedRectangles);
    } else if (rotateIndex !== null) {
      const updatedRectangles = rectangles.map((rect, index) => {
        if (index === rotateIndex) {
          const rectCenterX =
            Number(rect.x.replace("%", "")) +
            Number(rect.width.replace("%", "")) / 2;
          const rectCenterY =
            Number(rect.y.replace("%", "")) +
            Number(rect.height.replace("%", "")) / 2;

          const mousePosRelX = e.clientX - videoRect.left;
          const mousePosRelY = e.clientY - videoRect.top;

          // Calculate angle between rectangle's center and mouse position
          const dx = mousePosRelX - rectCenterX * (videoRect.width / 100);
          const dy = mousePosRelY - rectCenterY * (videoRect.height / 100);
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
  });

  const handleDelete = (index) => {
    const updatedRectangles = rectangles.filter((_, i) => i !== index);
    setRectangles(updatedRectangles);
    setSavedRectangles(updatedRectangles);
    localStorage.setItem("savedRectangles", JSON.stringify(updatedRectangles));
    setOpenConfirmDialog(false);
  };

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    videoElement.addEventListener("play", () => setIsPlaying(true));
    videoElement.addEventListener("pause", () => setIsPlaying(false));

    return () => {
      videoElement.removeEventListener("play", () => setIsPlaying(true));
      videoElement.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, []);

  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "10px",
          gap: "1em",
        }}
      >
        <Button onClick={handleEnterViewMode}>
          View Mode <Preview sx={{ marginLeft: "5px" }} />
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <IconButton onClick={handlePlayPause}>
            {isPlaying ? (
              <Pause sx={{ color: "error.main" }} />
            ) : (
              <PlayArrow sx={{ color: "success.main" }} />
            )}
          </IconButton>
          <Typography sx={{ width: "100%" }}>
            {currentTime.toFixed(2)}
          </Typography>
          <AccessTime sx={{ color: "primary.main" }} />
        </Box>
        <Button onClick={handleEnterEditMode}>
          Edit Mode <Construction sx={{ marginLeft: "5px" }} />
        </Button>
      </Box>
      <Box
        sx={{
          width: "fit-content",
          display: "flex",
          justifyContent: "center",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
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
        />

        {rectangles.map((rectangle, index) => (
          <CreateRectangle
            key={index}
            rectangle={rectangle}
            index={index}
            currentTime={currentTime}
            rectangles={rectangles}
            setRectangles={setRectangles}
            savedRectangles={savedRectangles}
            setSavedRectangles={setSavedRectangles}
            disabledRectangles={disabledRectangles}
            setDisabledRectangles={setDisabledRectangles}
            handleMouseDown={handleMouseDown}
            isDisabled={isDisabled}
            handleEdit={handleEdit}
            isEditMode={isEditMode}
            setOpenConfirmDialog={setOpenConfirmDialog}
            setSelectedIndex={setSelectedIndex}
          />
        ))}
      </Box>

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
            <DialogTitle sx={{ margin: "0 auto" }}>Edit Rectangle</DialogTitle>
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
                size="small"
                defaultValue={rectangles[selectedIndex]?.url}
                onChange={(event) => setEditUrl(event.target.value)}
                sx={{ marginTop: "1em" }}
              />
              {rectangles[selectedIndex]?.type === "dynamic" && (
                <TextField
                  label="Duration"
                  type="number"
                  fullWidth
                  size="small"
                  defaultValue={rectangles[selectedIndex]?.duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleSaveUrl(selectedIndex)}
                sx={{ margin: "0 auto" }}
                variant="contained"
              >
                Save
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
          />
          <Dialog open={openTypeDialog} onClose={handleCloseDialog}>
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
            <DialogTitle
              sx={{
                margin: "0 auto",
                fontWeight: "700",
                fontSize: "28px",
                padding: "1.5em 1.5em 0 1.5em",
              }}
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
            <DialogActions
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1em",
                marginTop: "1em",
              }}
            >
              {rectangleType && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setRectangleType("")}
                  >
                    Back
                  </Button>

                  <Button variant="contained" onClick={handleRectangleType}>
                    Create
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
      {openConfirmDialog && (
        <Dialog open={openConfirmDialog} onClose={handleCloseDialog}>
          <DialogTitle sx={{ margin: "0 auto" }}>Delete Rectangle</DialogTitle>
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
          <DialogContent>
            <Typography variant="h5">
              Are you sure you want to delete this rectangle?
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1em",
            }}
          >
            <Button
              onClick={() => handleDelete(selectedIndex)}
              variant="contained"
              color="error"
            >
              Yes
            </Button>
            <Button onClick={() => handleCloseDialog()} variant="contained">
              No
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default App;
