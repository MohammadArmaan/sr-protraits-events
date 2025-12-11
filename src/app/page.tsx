"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const Page = () => {
  const [sampleData, setSampleData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSampleUser() {
      try {
        const res = await fetch("/api/sample-user");
        const data = await res.json();

        if (isMounted) {
          setSampleData(data.users ?? []);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    }

    fetchSampleUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {sampleData.map((data, index) => (
        <div key={index}>
          <p>Name: <span>{data.name}</span></p>
          <p>Email: <span>{data.email}</span></p>
          <p>Image:</p>
          <img src={data.imageUrl} alt="upload" />
          
          
        </div>

      ))}
      
    </div>
  );
};

export default Page;
