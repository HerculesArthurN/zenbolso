import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
    isTransactionModalOpen: boolean;
    openTransactionModal: () => void;
    closeTransactionModal: () => void;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const openTransactionModal = () => setIsTransactionModalOpen(true);
    const closeTransactionModal = () => setIsTransactionModalOpen(false);
    const refreshData = async () => {
        // Placeholder for data refresh logic
        console.log('Data refresh triggered');
    };

    return (
        <DataContext.Provider value={{
            isTransactionModalOpen,
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
