const Post = ({ name, time, data }) => {
  return (
    <div class="max-w-md text-left mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-8 ">
      <div class="md:flex">
        <div class="md:shrink-0 items-center justify-center flex pl-4 ">
          <img
            class="h-24 w-24 object-cover"
            src="./avatar.png"
            alt="Modern building architecture"
          />
        </div>
        <div class="p-8">
          <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {name}
          </div>
          <p class="block mt-1 text-lg leading-tight font-medium text-black">
            {time}
          </p>
          <p class="mt-2 text-slate-500">{data}</p>
        </div>
      </div>
    </div>
  );
};

export default Post;
