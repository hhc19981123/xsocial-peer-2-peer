import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Post from "./components/post/index";
import Form from "./components/form/index";
import io from "socket.io-client";
import Peer from "./lib/simplepeer.min.js";
import { v1 as uuid } from "uuid";

import { Decodeuint8arr } from "./lib/messageHelper";


function App() {
  const [serverId, setServerId] = useState("");
  const [peers, setPeers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isConnect, setIsConnect] = useState(false);
  const socketRef = useRef(null);
  const peersRef = useRef([]);

  useEffect(() => {
    if (window.location.hash === "#init" && serverId === "") {
      const id = uuid();
      setServerId(id);
    }
  }, []);

  useEffect(() => {
    if (socketRef.current === null) {
      socketRef.current = io.connect("/");
      socketRef.current.emit("test");
    }
  }, []);

  const connect = useCallback((groupId) => {
    socketRef.current.emit("join room", groupId);
    socketRef.current.on("all users", (users) => {
      const peers = [];
      users.forEach((userID) => {
        const peer = createPeer(userID, socketRef.current.id);
        peersRef.current.push({
          peerID: userID,
          peer,
        });
        peers.push(peer);
      });
      setPeers(peers);
    });

    socketRef.current.on("user joined", (payload) => {
      const peer = addPeer(payload.signal, payload.callerID);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });

      setPeers((users) => [...users, peer]);
    });

    socketRef.current.on("receiving returned signal", (payload) => {
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });

    socketRef.current.on("room full", (payload) => {
      console.log("room full");
    });
  }, []);

  const disconnect = () => {
    /**
     * code for disconnect
     */
  };

  const addPost = (data) => {
    setPosts((pre) => [...pre, data]);
    console.log("posts",posts)
  };

  const receiveDataHandler = (uint8arrdata) => {
    const data = Decodeuint8arr(uint8arrdata);
    const parsedData = JSON.parse(data);
    if (parsedData.isRequest === "isRequest" && window.location.hash === "#init"){
      console.log("I am init")
      sendSnapshot()
    }else if(parsedData.isRequest === "notRequest"){
      console.log("receive data", parsedData);
      addPost(parsedData);
    }
  };

  const getSnapshot = () => {
    if (window.location.hash === "#init") {
      console.log("here's what i send to sendSnap",posts)
      sendSnapshot()
    }else {
      const isRequest = "isRequest";
      const data = {
        senderId: socketRef.current.id,
        timeStamp: new Date().toLocaleTimeString(),
        data: "isRequest",
        isRequest: isRequest,
      };
      const dataString = JSON.stringify(data);
      peersRef.current.forEach(({ peerID, peer }) => {
        console.log("peer send snap request", peer);
        peer.send(dataString);
      });
    }
  }

  const sendSnapshot = () => {
    console.log("posts:",posts);
    let messages = "";
    posts.forEach((post) => {
      messages += "senderId:"+post.senderId+",timeStamp:"+post.timeStamp+",message:"+post.data
    });
    const isRequest = "notRequest";
    const data = {
      senderId: socketRef.current.id,
      timeStamp: new Date().toLocaleTimeString(),
      data: messages,
      isRequest: isRequest,
    };
    const dataString = JSON.stringify(data);
    peersRef.current.forEach(({ peerID, peer }) => {
      console.log("peer send", peer);
      peer.send(dataString);
    });
    addPost(data);
  }

  const connectBtnHandler = useCallback(() => {
    if (serverId === "") {
      alert("Please input group id");
      return;
    }
    if (socketRef.current === null) {
      alert("socket io not init");
      return;
    }
    if (isConnect) {
      disconnect();
      setIsConnect(false);
    } else {
      connect(serverId);
      setIsConnect(true);
    }
  }, [connect, isConnect, serverId]);

  function createPeer(userToSignal, callerID) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("data", receiveDataHandler);

    return peer;
  }

  function addPeer(incomingSignal, callerID) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("data", receiveDataHandler);

    peer.signal(incomingSignal);

    return peer;
  }

  const serverIdOnchange = (e) => {
    e.preventDefault();
    setServerId(e.target.value);
  };

  useEffect(() => {
    console.log("show current", peers);
  }, [peers]);

  return (
    <div className="App">
      <header className="App-header h-32 bg-sky-600 text-white sticky top-0">
        <h1 className="text-3xl font-bold ">X-Social</h1>
        <h3 className="text-sm ">Decentralized Social Network</h3>
        <div className="inline-flex mt-4">
          <input
            type="text"
            className="h-6 w-32 mr-2 text-sm text-black"
            value={serverId}
            onChange={serverIdOnchange}
          />
          <button
            className="h-6 w-12 text-sm hover:text-black"
            onClick={connectBtnHandler}
          >
            {isConnect ? "disconnect" : "connect"}
          </button>
          <button
              className="h-6 w-12 text-sm hover:text-black"
              onClick={getSnapshot}
          >
            getSnapshot
          </button>
        </div>
      </header>
      <div className="App-body">
        <Form
          peersRef={peersRef}
          socketRef={socketRef}
          addMyPostMessage={addPost}
        />
        {posts.map(({ senderId, timeStamp, data }) => (
          <Post name={senderId} time={timeStamp} data={data} />
        ))}
      </div>
      <footer className="App-footer w-full h-16 bg-sky-600 static bottom-0 text-white ">
        footer
      </footer>
    </div>
  );
}

export default App;
