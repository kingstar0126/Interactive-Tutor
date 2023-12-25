import React, { useState } from "react";
import Select from "react-select";

const ROLES = [
  "Administrative and Management",
  "Specialist and Technical",
  "Pupil Support and Welfare",
  "Teaching and Learning Support",
  "Extracurricular Activities and Clubs",
  "Health and Safety",
  "Parent and Community Involvement",
];
const SUBJECTS = [
  "English",
  "Mathematics",
  "Science (Biology, Chemistry, Physics)",
  "History",
  "Modern Foreign Languages (e.g., French, Spanish, German, Mandarin)",
  "Classical Languages (e.g., Latin, Greek)",
  "Art",
  "Music",
  "Drama",
  "Design and Technology",
  "Computer Science",
  "Business Studies",
  "Physical Education",
  "Health Education",
  "Special Education",
  "Theologoy, Philosophy & Religious Education",
  "Home Economics",
];

const TASKS = [
  "Educational Delivery",
  "Student Engagement",
  "Assessment and Records",
  "Communication and Development",
  "Technology Integration",
  "Strategic Operations",
  "Policy and Community",
  "Facilities and Safety",
  "Curriculum and Staff Oversight",
  "Data and Analysis",
];

const FUNS = ["Historical Charachters", "Image Generation", "Games", "Misc"];

const DashBoard = () => {
  const [role, setRole] = useState(0);
  const [subject, setSubject] = useState(0);
  const [task, setTask] = useState(0);
  const [fun, setFun] = useState(0);
  const [sortby, setSortBy] = useState(0);

  return (
    <div className="container items-center justify-center m-auto py-5 gap-4">
      <div className="flex justify-between gap-4">
        <div className="flex gap-4 w-2/3">
          <Select
            onChange={(e) => setRole(e.value)}
            className="rounded-md w-1/4 border border-footerPrimary"
            placeholder="Role"
            options={ROLES.map((item, id) => {
              return { label: item, value: id };
            })}
          />

          <Select
            onChange={(e) => setSubject(e.value)}
            className="rounded-md w-1/4 border border-footerPrimary"
            placeholder="Subject"
            options={SUBJECTS.map((item, id) => {
              return { label: item, value: id };
            })}
          />

          <Select
            onChange={(e) => setTask(e.value)}
            className="rounded-md w-1/4 border border-footerPrimary"
            placeholder="Task"
            options={TASKS.map((item, id) => {
              return { label: item, value: id };
            })}
          />
          <Select
            onChange={(e) =>setFun(e.value)}
            className="rounded-md w-1/4 border border-footerPrimary"
            placeholder="Just For Fun"
            options={FUNS.map((item, id) => {
              return { label: item, value: id };
            })}
          />
        </div>
        <div className="w-1/3 justify-end items-center flex">
          <Select
            onChange={(e) => setSortBy(e.value)}
            className="rounded-md md:w-1/2 border-footerPrimary border"
            placeholder="Sort by"
            options={[{label: 'Most popular', value: 0}, {label: 'Newest', value: 1}]}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        
      </div>
    </div>
  );
};

export default DashBoard;
