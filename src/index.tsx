import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const fetchGetWrapper = () => {
  const cache: Record<string, unknown> = {};
  const yetToBeCached: Record<string, Promise<Response>> = {};
  const streamReaderTimer = (cache: Record<string, unknown>, url: string) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        clearInterval(interval);
        if (cache[url]) {
          resolve(true);
        } else {
          resolve(streamReaderTimer(cache, url));
        }
      }, 20);
    });
  };
  const cacheReqResponse = async (url: string) => {
    const response = await yetToBeCached[url];
    if (response.bodyUsed) {
      if (!cache[url]) {
        await streamReaderTimer(cache, url);
      }
    } else {
      const data = await response.json();
      cache[url] = data;
      delete yetToBeCached[url];
    }
    return cache[url];
  };
  return async function <T>(url: string): Promise<T> {
    if (url in cache) {
      return cache[url] as T;
    } else if (url in yetToBeCached) {
      return (await cacheReqResponse(url)) as T;
    } else {
      yetToBeCached[url] = fetch(url);
      return (await cacheReqResponse(url)) as T;
    }
  };
};

const customFetch = fetchGetWrapper();

const USERS_API = "https://mocki.io/v1/d4867d8b-b5d5-4a48-a4ab-79131b5809b8";

interface User {
  name: string;
  city: string;
}

const Comp1 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  useEffect(() => {
    const fn = async () => {
      setIsLoading(true);
      const data = await customFetch<User[]>(USERS_API);
      setIsLoading(false);
      setData(data);
    };
    fn();
  }, [setData]);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return <div>{JSON.stringify(data)}</div>;
};

const Comp2 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  useEffect(() => {
    const fn = async () => {
      setIsLoading(true);
      const data = await customFetch<User[]>(USERS_API);
      setIsLoading(false);
      setData(data);
    };
    fn();
  }, []);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return <div>{JSON.stringify(data)}</div>;
};

const App = () => {
  return (
    <div>
      <Comp1 />
      <Comp1 />
      <Comp2 />
      <Comp2 />
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
