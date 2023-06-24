import { useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import NewChat from "./NewChat";
import Branding from "./Branding";
import TrainData from "./TrainData";
import History from "./History";

export default function Example() {
  const [activeTab, setActiveTab] = useState("preview");
  const data = [
    {
      label: "Preview",
      value: "preview",
      desc: <NewChat />,
    },
    {
      label: "Branding",
      value: "branding",
      desc: <Branding />,
    },
    {
      label: "Training Data",
      value: "training Data",
      desc: <TrainData />,
    },
    {
      label: "Conversation Explorer",
      value: "conversation Explorer",
      desc: <History />,
    },
  ];
  return (
    <Tabs value={activeTab} id="custom-animation">
      <TabsHeader
        className="p-2"
        indicatorProps={{
          className:
            "bg-transparent border-b-[3px] pb-0 border-[--site-card-icon-color] shadow-none rounded-none",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={
              activeTab === value
                ? "text-[--site-card-icon-color] pb-0 font-bold"
                : ""
            }
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody
        animate={{
          initial: { y: 250 },
          mount: { y: 0 },
          unmount: { y: 250 },
        }}
      >
        {data.map(({ value, desc }) => (
          <TabPanel
            key={value}
            value={value}
            className="flex items-center justify-center bg-[--site-card-icon-color] rounded-xl min-h-[800px]"
          >
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}
