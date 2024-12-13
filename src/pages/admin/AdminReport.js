import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../../src/output.css';
import { fetchData } from '../../api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useEffect, useState } from 'react';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminReport = () => {
  const [monthlyCounts, setMonthlyCounts] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchMonthlyOccupants = async () => {
      try {
        const response = await fetchData(`admin/monthlyCounts?year=${year}`);
        setMonthlyCounts(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMonthlyOccupants();
  }, [year]); // Add `year` as a dependency to update data when it changes

  // Generate a random color
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  };

  // Prepare the data for the bar chart
  const barChartData = monthlyCounts
    ? {
        labels: monthlyCounts.map((item) => item.month), // Extract month names or labels from the data
        datasets: [
          {
            data: monthlyCounts.map((item) => item.occupied_rooms), // Extract counts from the data
            backgroundColor: monthlyCounts.map(() => getRandomColor()), // Assign random colors to each bar
            borderColor: monthlyCounts.map(() => getRandomColor().replace('0.6', '1')), // Ensure matching border colors with full opacity
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="flex min-w-screen">
      <div className="w-[320px]">
        <AdminSidebar menu={'report'} />
      </div>
      <div className="flex-1 p-10 text-center">
        <p className="text-4xl font-bold mb-4">REPORTS</p>

        <div className="">
          <div className="mt-4">
            <label htmlFor="year" className="mr-2 font-bold">Select Year:</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="p-2 border rounded"
            >
              {[...Array(10)].map((_, i) => {
                const currentYear = new Date().getFullYear();
                return (
                  <option key={i} value={currentYear - i}>
                    {currentYear - i}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-row items-center">
            <FontAwesomeIcon icon={faPeopleGroup} className="mr-2" />
            <p className="text-2xl font-bold">{year} CHECK-INS REPORT</p>
          </div>
          
          <div className="border mt-6"></div>

          {/* Render the bar chart only if data is available */}
          {barChartData ? (
            <div className="mt-6">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false, // Remove the legend at the top
                    },
                    title: {
                      display: true, // Remove the title at the top
                    },
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Check-ins', // Add label to the Y-axis
                        font: {
                          size: 16,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p>Loading chart data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReport;
