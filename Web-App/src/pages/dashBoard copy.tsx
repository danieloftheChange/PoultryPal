import React, { useEffect, useState } from "react";
import Navbar2 from "../components/navBar2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import Layout from "@/components/layout";
import { Thermometer, Droplet, AlertCircle, Cloud } from "lucide-react";

const generateSensorData = () => ({
  temperature: (Math.random() * 10 + 20).toFixed(2),
  humidity: (Math.random() * 30 + 50).toFixed(2),
  ammonia: (Math.random() * 20 + 5).toFixed(2),
  co2: (Math.random() * 500 + 400).toFixed(2),
});

const DashboardPage: React.FC = () => {
  const [sensorData, setSensorData] = useState({
    temperature: "0",
    humidity: "0",
    ammonia: "0",
    co2: "0",
  });

  const [history, setHistory] = useState({
    temperature: [] as number[],
    humidity: [] as number[],
    ammonia: [] as number[],
    co2: [] as number[],
    time: [] as string[],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newSensorData = generateSensorData();
      setSensorData(newSensorData);

      setHistory((prev) => ({
        temperature: [...prev.temperature.slice(-9), parseFloat(newSensorData.temperature)],
        humidity: [...prev.humidity.slice(-9), parseFloat(newSensorData.humidity)],
        ammonia: [...prev.ammonia.slice(-9), parseFloat(newSensorData.ammonia)],
        co2: [...prev.co2.slice(-9), parseFloat(newSensorData.co2)],
        time: [
          ...prev.time.slice(-9),
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        ],
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateChartData = (data: number[], label: string, color: string) => ({
    labels: history.time,
    datasets: [
      {
        label,
        data,
        fill: false,
        borderColor: color,
        tension: 0.3,
      },
    ],
  });

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        <Navbar2 />
        <main className="flex-grow px-8 py-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {[
                { title: "Temperature", value: `${sensorData.temperature}°C`, icon: <Thermometer size={24} className="text-gray-700" /> },
                { title: "Humidity", value: `${sensorData.humidity}%`, icon: <Droplet size={24} className="text-gray-700" /> },
                { title: "Ammonia Levels", value: `${sensorData.ammonia} ppm`, icon: <AlertCircle size={24} className="text-gray-700" /> },
                { title: "CO2 Levels", value: `${sensorData.co2} ppm`, icon: <Cloud size={24} className="text-gray-700" /> },
              ].map((sensor, index) => (
                <Card
                  key={index}
                  className="flex-shrink-0 w-full sm:w-56 h-24 p-4 shadow rounded-lg"
                >
                  <CardHeader className="flex justify-between p-0">
                    <div className="flex items-center justify-between w-full">
                      <CardTitle className="text-gray-700 text-sm">{sensor.title}</CardTitle>
                      {sensor.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl text-gray-800 mt-1 font-bold">{sensor.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {[
                { label: "Temperature (°C)", data: history.temperature, color: "rgba(75,192,192,1)" },
                { label: "Humidity (%)", data: history.humidity, color: "rgba(0, 128, 128, 1)" }, // Teal
                { label: "Ammonia Levels (ppm)", data: history.ammonia, color: "rgba(255,206,86,1)" },
                { label: "CO2 Levels (ppm)", data: history.co2, color: "rgba(153,102,255,1)" },
              ].map((chart, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{chart.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line data={generateChartData(chart.data, chart.label, chart.color)} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DashboardPage;
