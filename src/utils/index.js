// Utility functions for data formatting
export const formatters = {
    currency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    date(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    },

    percentage(value, total) {
        return ((value / total) * 100).toFixed(1);
    }
};