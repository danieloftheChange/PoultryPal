import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const diagnosisSchema = z.object({
    image: z.any().refine((fileList) => fileList?.length > 0, {
        message: 'Image is required',
    }),
});

interface Diagnosis {
    id: string;
    imageUrl: string;
    disease: string;
    confidence: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

function DiagnosisPage() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(diagnosisSchema),
        defaultValues: {
            image: undefined,
        },
    });

    const accessToken = localStorage.getItem('accessToken');

    const onSubmit = async (values: z.infer<typeof diagnosisSchema>) => {
        setLoading(true);
        setError(null);
        const file = values.image[0];

        if (!file) return;

        try {
            const fileRef = ref(storage, `PoultryPal-diagnosis/${file.name}`);
            await uploadBytes(fileRef, file);
            const imageUrl = await getDownloadURL(fileRef);

            const formData = new FormData();
            formData.append('file', file);

            const predictionResponse = await axios.post('http://localhost:8000/predict', formData);
            const predictionData = predictionResponse.data;

            if (predictionData.status === 'invalid') {
                setLoading(false);
                setError('Please upload a clear photo of poultry droppings');
                return;
            }

            const disease = predictionData.prediction?.predicted_class ?? 'Unknown';
            const confidence = predictionData.prediction?.confidence ?? 'Unknown';

            await axios.post(
                'http://92.112.180.180:3000/api/v1/diagnosis',
                {
                    imageUrl,
                    disease,
                    confidence,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            form.reset();
            setLoading(false);
            setOpen(false);
        } catch (err) {
            console.error('Error submitting diagnosis:', err);
            setLoading(false);
        }
    };

    // const onSubmit = async (values: z.infer<typeof diagnosisSchema>) => {
    //     setLoading(true);
    //     const file = values.image?.[0];

    //     if (!file) return;

    //     try {
    //         const fileRef = ref(storage, `PoultryPal-diagnosis/${file.name}`);
    //         await uploadBytes(fileRef, file);
    //         const imageUrl = await getDownloadURL(fileRef);

    //         let disease = 'unknown';

    //         if (file.name.includes('cocci')) {
    //             disease = 'cocci';
    //         } else if (file.name.includes('salmo')) {
    //             disease = 'salmo';
    //         } else if (file.name.includes('ncd')) {
    //             disease = 'ncd';
    //         } else {
    //             disease = 'healthy';
    //         }

    //         const confidence = Math.floor(Math.random() * 20) + 81;

    //         await axios.post(
    //             'http://92.112.180.180:3000/api/v1/diagnosis',
    //             {
    //                 imageUrl,
    //                 disease,
    //                 confidence,
    //             },
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${accessToken}`,
    //                 },
    //             }
    //         );

    //         form.reset();
    //         setLoading(false);
    //         setOpen(false);
    //     } catch (err) {
    //         console.error('Error submitting diagnosis:', err);
    //         setLoading(false);
    //     }
    // };

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

    return (
        <Layout>
            <Navbar2 />
            <div className="w-full space-y-4">
                <div className="bg-white px-8 py-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-800">Disease Diagnosis</h2>
                        <Dialog open={open} onOpenChange={(open) => {
                            setOpen(open);
                            if (!open) setError(null);
                        }}>
                            <DialogTrigger>
                                <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-green-800">
                                    Add Diagnosis
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Diagnosis</DialogTitle>
                                    <DialogDescription>
                                        Upload an image below to perform diagnosis.
                                    </DialogDescription>
                                </DialogHeader>
                                <section className="p-2">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                                            {error && (
                                                <div className="rounded-md bg-red-50 p-4">
                                                    <div className="flex">
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-red-800">Invalid Image</h3>
                                                            <div className="mt-2 text-sm text-red-700">
                                                                <p>{error}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <FormField
                                                control={form.control}
                                                name="image"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Upload Image</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => field.onChange(e.target.files)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                                                {loading ? 'Diagnosing...' : 'Diagnose'}
                                            </Button>
                                        </form>
                                    </Form>
                                </section>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="container mx-auto mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {diagnoses.map((entry: Diagnosis) => (
                                <div key={entry?.id} className="rounded-lg mb-4">
                                    <img
                                        src={entry?.imageUrl}
                                        alt={entry?.disease}
                                        className="w-full h-28 object-cover rounded-md mb-3"
                                    />
                                    <div className="flex pl-1 justify-between">
                                        <p className="text-lg font-semibold text-gray-800">
                                            {(() => {
                                                const diseaseMap: Record<string, string> = {
                                                    salmo: "Salmonella",
                                                    ncd: "New Castle Disease",
                                                    cocci: "Coccidiosis",
                                                    healthy: "Healthy",
                                                };

                                                const name = entry?.disease ? diseaseMap[entry.disease] || entry.disease : "Unknown";

                                                if (entry?.confidence !== undefined && entry.confidence < 0.88) {
                                                    return (
                                                        <>
                                                            {name} <span className="text-gray-700">(Uncertain)</span>
                                                        </>
                                                    );
                                                } else {
                                                    return name;
                                                }
                                            })()}
                                        </p>
                                        <MoreVertical className="w-4 h-4 text-gray-600 cursor-pointer" />
                                    </div>
                                    <p className="text-xs pl-1 mb-2 mt-1 text-gray-600">
                                        {entry?.createdAt
                                            ? `${new Date(entry.createdAt).toDateString()} ${new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                            : "Date unknown"}
                                    </p>
                                    <button
                                        onClick={() => {
                                            navigate(`/diagnosis/${entry?.id}`);
                                        }}
                                        className="text-black pl-1 underline text-sm decoration-black hover:text-blue-600 hover:decoration-blue-600"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default DiagnosisPage;