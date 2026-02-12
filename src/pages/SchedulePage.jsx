import React, { useState } from "react";
import ScheduleList from "../component/shedules/ScheduleList";
import ScheduleForm from "../component/shedules/ScheduleForm";


function SchedulePage() {
  const [justCreated, setJustCreated] = useState(null);

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Schedule Maintenance</h1>
      <ScheduleForm onCreated={(newSch) => {
        setJustCreated(newSch);
        // optionally refetch list
      }} />

      <ScheduleList key={justCreated?._id /* force re-render if new one added */} />
    </div>
  );
}

export default SchedulePage;
