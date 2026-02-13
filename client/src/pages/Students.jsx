import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  return (
    <div>
      <h2>Students List</h2>
      <ul>
        {students.map(s => (
          <li key={s.id}>{s.name} - {s.class}</li>
        ))}
      </ul>
    </div>
  );
}

export default Students;
