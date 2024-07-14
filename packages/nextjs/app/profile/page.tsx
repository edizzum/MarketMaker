"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [updateData, setUpdateData] = useState({
    name: "",
    email: "",
    website: "",
    twitter: "",
  });
  async function handleSubmit(event: any) {
    event.preventDefault();
    try {
      const { name, email, website, twitter } = event.target;
      console.log(event.target.name.value, email.value, website.value, twitter.value);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="flex flex-col border rounded-3xl px-20 py-6 w-2/3 max-w-6xl backdrop-blur-sm bg-black/20 mx-auto mt-20 ">
      <h1 className="text-4xl font-bold mb-3">Connection To WorldID</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 w-full">
        <label htmlFor="name">Email</label>
        <input defaultValue={updateData.name} type="text" id="name" name="name" />
        <label htmlFor="email">Gmail</label>
        <input defaultValue={updateData.email}  type="email" id="email" name="email" />
        <label htmlFor="website">Discord</label>
        <input defaultValue={updateData.website}  type="text" id="website" name="website" />
        <label htmlFor="twitter">Twitter</label>
        <input defaultValue={updateData.twitter}  type="text" id="twitter" name="twitter" />
        <label htmlFor="twitter">Phone Number</label>
        <input defaultValue={updateData.twitter}  type="text" id="twitter" name="twitter" />
        <button
          className="
        bg-gradient-to-r from-[#f4ca3f] to-[#e3950f] text-white px-4 py-2 rounded-3xl w-1/2 mx-auto mt-4 opacity-70 hover:opacity-100 transition duration-200 ease-in-out
        "
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
