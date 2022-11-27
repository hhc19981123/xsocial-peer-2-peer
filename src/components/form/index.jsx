import { useState } from "react";

const Form = ({ peersRef, socketRef, addMyPostMessage }) => {
  const [text, setText] = useState();
  const changeHandler = (e) => {
    e.preventDefault();
    setText(e.target.value);
  };
  const clearTextInput = () => {
    setText("");
  };
  const postMessageHandler = () => {
    if (peersRef.current && peersRef.current?.length !== 0) {
      try {
        const isRequest = "notRequest";
        const data = {
          senderId: socketRef.current.id,
          timeStamp: new Date().toLocaleTimeString(),
          data: text,
          isRequest: isRequest,
        };
        const dataString = JSON.stringify(data);
        peersRef.current.forEach(({ peerID, peer }) => {
          console.log("peer send", peer);
          peer.send(dataString);
        });
        console.log("text:",text)
        addMyPostMessage(data);
        clearTextInput();
      } catch (error) {
        console.log("peer send error", error);
      }
    } else {
      alert("Please connect first");
      return;
    }
  };

  return (
    <div class="max-w-md text-left mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-8 ">
      <div class="md:flex">
        <div class="p-8">
          <p class="mt-2 text-slate-500">
            Welcome to xsocial, a real decentralized social media platform.
            Let's share your story.
          </p>
          <div className="mt-4">
            <label
              htmlFor="about"
              className="block text-sm font-medium text-gray-700"
            >
              Home
            </label>
            <div className="mt-1">
              <textarea
                id="about"
                name="about"
                value={text}
                onChange={changeHandler}
                rows={3}
                className="block w-full mt-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="What's happening"
                defaultValue={""}
              />
            </div>
            <div className="py-3 text-right">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={postMessageHandler}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
