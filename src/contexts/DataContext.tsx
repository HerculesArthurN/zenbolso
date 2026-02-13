import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
    isTransactionModalOpen: boolean;
    transactionToEdit: any | null;
    openTransactionModal: (transaction?: any) => void;
    closeTransactionModal: () => void;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<any | null>(null);

    const openTransactionModal = (transaction?: any) => {
        if (transaction) {
            setTransactionToEdit(transaction);
        } else {
            setTransactionToEdit(null);
        }
        setIsTransactionModalOpen(true);
    };

    const closeTransactionModal = () => {
        setIsTransactionModalOpen(false);
        setTransactionToEdit(null);
    };

    const refreshData = async () => {
        // Placeholder for data refresh logic
        console.log('Data refresh triggered');
    };

    return (
        <DataContext.Provider value={{
            isTransactionModalOpen,
            transactionToEdit,
            openTransactionModal,
            closeTransactionModal,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
