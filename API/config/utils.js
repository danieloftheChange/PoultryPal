import axios from "axios";

const MODEL_URL = "https://ml-model.com/predict";

export const getDiseasePrediction = async (image) => {
  try {
    const formData = new FormData();
    formData.append("image", image.buffer, image.originalname);

    const response = await axios.post(MODEL_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.disease;
  } catch (error) {
    console.error("Error getting disease prediction:", error);
    return null;
  }
};