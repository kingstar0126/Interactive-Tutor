import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import { MdDone } from "react-icons/md";
import AccordionComponent from "../Components/Accordion";
import StripeCard from "../Components/StripeCard";
import Switch from "../Components/Switch";

const Home = () => {
  return (
    <div className="bg-[--site-main-color-home] font-logo">
      <Header />

      {/* Hero Section */}
      <div className="pt-[100px] py-[30px]">
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div className="container flex flex-col items-center justify-center leading-tight">
            <p className="text-white text-[45px] font-semibold items-center justify-center">
              Create Your Own AI Chatbot Using
            </p>
            <p className="text-white text-[45px] font-semibold items-center justify-center">
              <span className="text-[--site-logo-text-color] underline underline-offset-8">
                Your Data And Branding
              </span>
              {"  "}That You Can{" "}
            </p>
            <p className="text-white text-[45px] font-semibold items-center justify-center">
              Embed Everywhere
            </p>
          </div>
          <div className="container flex flex-col items-center justify-center gap-5 leading-tight">
            <span className="pt-10 py-7 text-[--site-logo-text-color] text-[16px] font-semibold items-center justify">
              BUILD YOUR GPT CHATBOT WITH NO CODING USING EXISTING DATA FROM
              DOCUMENTS, WEBSITES, AND VIDEOS 🚀
            </span>
            <span className="text-white text-[17px] font-semibold items-center justify">
              Upload your documents or add links, and voila! Integrate your
              trained chatbot to your website as a window or as a bubble for
              instant
            </span>
            <span className="text-white text-[17px] font-semibold items-center justify">
              engagement with your users.
            </span>

            <div className="flex flex-col pt-7">
              <button className="text-black rounded-xl p-2 bg-[--site-logo-text-color] hover:scale-105 active:bg-[--site-main-color5]">
                <span className="h-[24px] font-medium px-3">
                  Build Your GPT & Bard Bot Now - For free
                </span>
              </button>
              <span className="flex items-center justify-center text-[12px] font-default py-3 text-white">
                Free, no CC required!
              </span>
            </div>
            <div className="container flex items-center justify-center pt-5 text-white">
              <div className="flex items-center justify-center mr-4">
                <div className="bg-[--site-main-color5] rounded-full text-black p-1 m-2 w-[20px] h-[20px] items-center justify-center flex">
                  <MdDone className="pointer-events-none" />
                </div>
                GPT & Bard
              </div>
              <div className="flex items-center justify-center mr-4">
                <div className="bg-[--site-main-color5] rounded-full text-black p-1 m-2 w-[20px] h-[20px] items-center justify-center flex">
                  <MdDone className="pointer-events-none" />
                </div>
                Access Chat History
              </div>
              <div className="flex items-center justify-center mr-4">
                <div className="bg-[--site-main-color5] rounded-full text-black p-1 m-2 w-[20px] h-[20px] items-center justify-center flex">
                  <MdDone className="pointer-events-none" />
                </div>
                No Credit Card Required
              </div>
              <div className="flex items-center justify-center mr-4">
                <div className="bg-[--site-main-color5] rounded-full text-black p-1 m-2 w-[20px] h-[20px] items-center justify-center flex">
                  <MdDone className="pointer-events-none" />
                </div>
                No Engagement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="my-[30px] py-[30px] flex flex-col items-center w-full">
        <div className="container flex items-center justify-center text-[36px] font-semibold text-white">
          A Preview Of Our
          <span className="mx-2 text-[--site-logo-text-color] underline">
            {" "}
            Amazing{" "}
          </span>
          Features
        </div>
        <div className="container flex flex-col gap-5 m-5">
          <div className="container flex items-start justify-center gap-5">
            <AccordionComponent
              title={"White-Label & Theming"}
              body={
                "No branding on your chat widget, allowing you to fully customize the interface to match your brand."
              }
            />
            <AccordionComponent
              title={"Cloud Training"}
              body={
                "You can adjust the behavior and smartness of your chat widget in real-time to meet the changing needs of your customers by providing your own data."
              }
            />
            <AccordionComponent
              title={"Access To Chat History"}
              body={
                "You own all the data collected through your chat widget, giving you complete control over your customer interactions."
              }
            />
          </div>
          <div className="container flex items-start justify-center gap-5">
            <AccordionComponent
              title={"Window or Bubble"}
              body={
                "Choose how your chat widget appears on your website with a fully customizable interface. As a chat window ? Or as a chat bubble ?"
              }
            />
            <AccordionComponent
              title={"Latest OpenAI Model"}
              body={
                "We use the latest publicly available OpenAI model, offering the best in natural language processing and customization."
              }
            />
            <AccordionComponent
              title={"Define GPT-3.5 Behavior"}
              body={
                "Customize your chat widget’s behavior with pre-defined system prompt, so it can do specific tasks like writing Google Ads or very specific industry tasks."
              }
            />
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="my-[30px] py-[30px] flex flex-col items-center w-full">
        <div className="container flex items-center text-white justify-center text-[36px] font-semibold">
          Choose The Best,
          <span className="mx-2 text-[--site-logo-text-color] underline">
            {" "}
            Affordable & Transparent{" "}
          </span>
          Pricing 💸
        </div>
        <div className="container flex flex-col items-center justify-center gap-5 p-5 text-white flex-color">
          <div className="container flex items-center justify-center gap-3">
            Annually
            <Switch />
            Monthly
          </div>
          <div className="container flex items-center justify-center gap-1">
            <StripeCard />
            <StripeCard />
            <StripeCard />
            <StripeCard />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
