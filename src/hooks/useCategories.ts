import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { Category } from '../types';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.fetchCategories();
            setCategories(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    return { categories, loading, error, refresh: loadCategories };
};
