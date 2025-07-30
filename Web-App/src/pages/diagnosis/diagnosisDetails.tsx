import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { useQuery } from '@tanstack/react-query';

interface Diagnosis {
    id: string;
    imageUrl: string;
    disease: string;
    confidence: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

const DiagnosisDetailPage = () => {
    const { id } = useParams();
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
    const accessToken = localStorage.getItem('accessToken');

    const { data: diagnoses = [] } = useQuery<Diagnosis[]>({
        queryKey: ['diagnoses'],
        queryFn: async () => {
            try {
                const res = await fetch('http://92.112.180.180:3000/api/v1/diagnosis', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch diagnosis data');
                return res.json();
            } catch (err) {
                console.error('Failed to fetch diagnosis data:', err);
                throw err;
            }
        },
        refetchInterval: 3000,
    });

    useEffect(() => {
        if (diagnoses.length && id) {
            const diagnosisData = diagnoses.find((entry) => entry.id === id);
            setDiagnosis(diagnosisData || null);
        }
    }, [diagnoses, id]);

    const diseaseInfo = {
        healthy: {
            symptoms: "Poultry appears active, healthy feathers, good appetite, and no signs of disease.",
            treatment: "No treatment needed, just ensure proper nutrition, water, and living conditions.",
            precautions: "Maintain good hygiene, provide proper nutrition, and ensure biosecurity measures are in place.",
        },
        salmo: {
            symptoms: "Symptoms include lethargy, loss of appetite, diarrhea (often green), vomiting, and fever.",
            treatment: "Use antibiotics as prescribed by a veterinarian. Provide supportive care like hydration and electrolytes.",
            precautions: "Ensure proper food hygiene, water cleanliness, and isolate affected birds to prevent spread. Practice regular cleaning and sanitization.",
        },
        cocci: {
            symptoms: "Symptoms include diarrhea (often bloody), weight loss, dehydration, and lethargy. Coccidiosis can lead to sudden death in severe cases.",
            treatment: "Administer coccidiostats (medication to control coccidia) or antibiotics, as prescribed by a veterinarian.",
            precautions: "Ensure clean and dry bedding, avoid overcrowding, and limit exposure to contaminated feed and water. Disinfect housing regularly.",
        },
        ncd: {
            symptoms: "Symptoms include respiratory distress (coughing, sneezing), drooping wings, twisted neck, paralysis, and diarrhea. Birds may also have a loss of appetite.",
            treatment: "No specific treatment; supportive care can be given, including fluid therapy. Vaccination is the most effective prevention method.",
            precautions: "Newcastle Disease is highly contagious. Quarantine new birds before introduction, and ensure strict biosecurity protocols. Vaccinate flocks regularly.",
        },
    };

    const currentDisease = diagnosis?.disease ? diseaseInfo[diagnosis.disease as keyof typeof diseaseInfo] : null;

    return (
        <Layout>
            <Navbar2 />
            <div className="bg-white px-8 py-5">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {(() => {
                            const diseaseMap: Record<string, string> = {
                                salmo: "Salmonella",
                                ncd: "New Castle Disease",
                                cocci: "Coccidiosis",
                                healthy: "Healthy",
                            };

                            const rawDisease = diagnosis?.disease;
                            const name = rawDisease ? diseaseMap[rawDisease] || rawDisease : "No diagnosis";

                            if (diagnosis?.confidence !== undefined && diagnosis.confidence < 0.88) {
                                return (
                                    <>
                                        {name} <span className="text-gray-700">(Uncertain)</span>
                                    </>
                                );
                            }

                            return name;
                        })()}
                    </h2>
                </div>
                <div className="w-full">
                    <div className="flex justify-between space-x-4 w-full">
                        <div className="mt-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-14">
                            <div className="flex flex-col space-y-6">
                                <img
                                    src={diagnosis?.imageUrl || "Unknown"}
                                    alt={diagnosis?.disease || "Unknown"}
                                    className="w-96 h-60 object-cover rounded-md"
                                />
                                <p className="text-sm text-gray-600">
                                    {diagnosis?.createdAt
                                        ? `${new Date(diagnosis.createdAt).toDateString()} ${new Date(diagnosis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                        : "Date unknown"}
                                </p>
                                {/* <button className="rounded bg-gray-500 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-green-800">
                                    Confidence Score: {diagnosis?.confidence ? `${Math.round(diagnosis.confidence * 100)}%` : "Unknown"}
                                </button> */}
                                <button className="rounded bg-gray-500 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-green-800">
                                    Confidence Score: {diagnosis?.confidence ? `${Math.round(diagnosis.confidence * 100)}%` : "Unknown"}
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 space-y-6 flex-1">
                            <div className="bg-gray-100 p-6 border rounded-lg w-full">
                                <h3 className="text-lg font-medium text-gray-700">Symptoms</h3>
                                <p className="text-sm text-gray-600 mt-2">{currentDisease?.symptoms}</p>
                            </div>
                            <div className="bg-gray-100 p-6 border rounded-lg w-full mt-6">
                                <h3 className="text-lg font-medium text-gray-700">Treatment</h3>
                                <p className="text-sm text-gray-600 mt-2">{currentDisease?.treatment}</p>
                            </div>
                            <div className="bg-gray-100 p-6 border rounded-lg w-full mt-6">
                                <h3 className="text-lg font-medium text-gray-700">Precautions</h3>
                                <p className="text-sm text-gray-600 mt-2">{currentDisease?.precautions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DiagnosisDetailPage;