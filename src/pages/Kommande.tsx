import { useEffect, useState } from "react";

const API = "";

interface Movie {
    id: number;
    title: string;
    ageRestriction: number;
    screeningDate: string;
    image_url?: string | null;
}