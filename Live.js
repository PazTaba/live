import React, {useState, useEffect, useContext} from "react";
import {FileNameContext} from "../../App";
import {SpinnerDiamond} from "spinners-react";
import {useNavigate} from "react-router-dom";
import design from "../../css/LiveStream/Live.moudule.css";
import alertSound from "../../assets/audio/alert.mp3";

const LiveStream = () => {
    const audio = new Audio(alertSound);
    const {isActive, setIsActive} = useContext(FileNameContext);
    const navigate = useNavigate();
    const [frames, setFrames] = useState([]); // שימור של רשימת הסרטונים
    const [isPlaying, setIsPlaying] = useState(false);
    const [DetConfidence, setDetConfidence] = useState(0);
    const [buttonClick, SetButtonClick] = useState(false);
    const Swal = require("sweetalert2");

    let socket;
    let urlVideo;
    let activeAlgorithm;
    let adminStorage;

    urlVideo = localStorage.getItem("urlStream");

    useEffect(() => {
        if (buttonClick) {
            urlVideo = localStorage.getItem("urlStream");
            adminStorage = localStorage.getItem("admin");
            activeAlgorithm = localStorage.getItem("activeAlgorithm");
            if (activeAlgorithm == "true") {
                activeAlgorithm = true;
            } else {
                activeAlgorithm = false;
            }
            console.log(isActive);
            console.log("adminStorage :", adminStorage);
            if (adminStorage == "false") {
                console.log("hi");
                socket = new WebSocket("ws://localhost:3005/ws/stream/");
                socket.onopen = function (event) {
                    socket.send(
                        JSON.stringify({
                            start: true,
                            url: urlVideo,
                            active: activeAlgorithm,
                        })
                    );
                };
            } else {
                socket = new WebSocket("ws://localhost:3005/ws/stream/");
                console.log("adminStorage2 :", adminStorage);
                socket.onopen = function (event) {
                    socket.send(
                        JSON.stringify({
                            start: true,
                            // url: urlVideo,
                            // active: activeAlgorithm,
                        })
                    );
                };
            }

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("data:", data);
                if (data.frame) {
                    const frame = "data:image/jpeg;base64," + data.frame;
                    const detection = data.confidence;
                    setFrames((prevFrames) => [
                        ...prevFrames,
                        {frame, detection}
                    ]);
                    setIsPlaying(data.streamOn);
                }
                setIsPlaying(data.streamOn);
                if (data.streamOn === false && adminStorage == "true") {
                    Swal.fire({
                        position: "row",
                        icon: "success",
                        title: "Streaming completed successfully",
                        showConfirmButton: true,
                        confirmButtonText: "Keep To Investigation screen",
                        showCancelButton: true,
                        cancelButtonText: "Change Stream Video",
                        showDenyButton: "true",
                        denyButtonText: "Stay In live Stream",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setFrames([]); // מרוקן את רשימת הסרטונים
                            navigate("/investigation");
                        }
                        if (result.isDismissed) {
                            navigate("/settings");
                        }
                        if (result.isDenied) {
                            navigate("/live");
                        }
                    });
                    SetButtonClick(false);
                }
                if (data.streamOn === false && adminStorage == "false") {
                    Swal.fire({
                        position: "row",
                        icon: "success",
                        title: "Streaming completed successfully",
                        showConfirmButton: true,
                        confirmButtonText: "Keep To Investigation screen",
                        showDenyButton: "true",
                        denyButtonText: "Stay In live Stream",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setFrames([]); // מרוקן את רשימת הסרטונים
                            navigate("/investigation");
                        }
                        if (result.isDenied) {
                            navigate("/live");
                        }
                    });
                    SetButtonClick(false);
                }
            };
        }

        return () => {
            // socket?.close();
            // setChildren([]);
        };
    }, [buttonClick]);

    //background div Data
    const getBackground = (detection) => {
        if (detection > 0.01 && detection < 0.2) {
            return "#fec9c9";
        } else if (detection >= 0.2 && detection < 0.4) {
            return "#ffa1a1";
        } else if (detection >= 0.4 && detection < 0.6) {
            return "#ff8080";
        } else if (detection >= 0.6 && detection < 0.8) {
            return "#ff5f5f";
        } else if (detection >= 0.8 && detection < 1) {
            return "#ff0e0e";
        }
    };

    //Show Time
    const getCurrentTime = () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1; // Add 1 to get the correct month (January is 0)
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return `${day}/${month < 10 ? `0${month}` : month} - ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div>
            <div className="datac">
                <div className="containerr">
                    <div className="textContainer">
                        <h1 className="text">Live Stream</h1>
                    </div>
                </div>
                {!isPlaying ? (
                    <button
                        className="buttonLive"
                        onClick={() => {
                            SetButtonClick(true);
                        }}
                    >
                        Start Live Stream
                    </button>
                ) : (
                    ""
                )}

                <div className="videos-container">
                    {frames.map((frameData, index) => (
                        <div key={index} className="video">
                            <img src={frameData.frame} alt={`Stream ${index}`}/>
                            {frameData.detection > 0 && (
                                <div
                                    className="cardStreamData"
                                    style={{
                                        backgroundColor: getBackground(frameData.detection),
                                        height: "140px",
                                        marginBottom: "10px",
                                        width: "202px",
                                        marginLeft: "3px",
                                        marginTop: "2px",
                                        border: "solid 2px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            marginLeft: "50px",
                                            borderBottom: "1px solid black",
                                            width: "58%",
                                            fontFamily: "serif",
                                            marginTop: "2px",
                                        }}
                                        className="confidenceData"
                                    >
                                        Detection <br/>
                                    </h3>
                                    <h4 className="confidence">{frameData.detection}</h4>
                                    <h3
                                        style={{
                                            marginLeft: "32px",
                                            borderBottom: "1px solid black",
                                            width: "71%",
                                        }}
                                        className="timeHead"
                                    >
                                        Cureent Time <br/>
                                    </h3>
                                    <h4 className="timeText">{getCurrentTime()}</h4>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div>
                    {DetConfidence > 0 ? (
                        <div className="loader">
                            <span></span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
