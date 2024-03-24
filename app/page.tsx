import Image from "next/image";
import {PollCreateForm} from "./form";
// import Logo from "./image-removebg-preview.png";

export let metadata = {
  title: "ShareSphere",
  description: "Perfect your vision with ShareSphere",
};

export default async function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <div className="flex justify-center items-center  rounded-full w-16 sm:w-24 h-16 sm:h-24 my-8">
          {/* <img src={Logo} className="h-8 sm:h-16 invert p-3 mb-1" /> */}
          <Image src={require("./image-removebg-preview.png")} alt="Farcaster Logo" width={100} height={100} />
        </div>
        <h1 className="text-lg sm:text-2xl font-bold mb-2">
          ShareSphere
        </h1>
        <h2 className="text-md sm:text-xl mx-4">
          Perfect your vision with ShareSphere
        </h2>
        <div className="flex flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
          <PollCreateForm />
        </div>
      </main>
    </div>
  );
}