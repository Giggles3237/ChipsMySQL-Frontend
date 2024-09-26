import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import separate components
import ChipTable from './components/ChipTable';
import SalesTable from './components/SalesTable';
import EditSaleForm from './components/EditSaleForm';
import DateRangePicker from './components/DateRangePicker';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/sales`);
      console.log('Fetched sales:', response.data);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError(`Failed to fetch sales data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleDateChange = useCallback((start, end) => {
    console.log('Date range changed:', start, end);
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (!sale) return false;
      
      const saleDate = new Date(sale.deliveryDate);
      saleDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison

      const dateMatch = 
        (!startDate || saleDate >= startDate) && 
        (!endDate || saleDate <= endDate);

      const searchMatch = Object.values(sale).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      return dateMatch && searchMatch;
    });
  }, [sales, startDate, endDate, searchTerm]);

  const handleEditSubmit = useCallback(async (updatedSale) => {
    try {
      if (!updatedSale.id) {
        // For new sales, don't include an id field
        const { id, ...saleWithoutId } = updatedSale;
        await axios.post(`${API_BASE_URL}/sales`, saleWithoutId);
      } else {
        // For existing sales, use the id in the URL
        await axios.put(`${API_BASE_URL}/sales/${updatedSale.id}`, updatedSale);
      }
      await fetchSales();
      setEditingSale(null);
    } catch (error) {
      console.error('Error saving sale:', error);
      setError(`Failed to save sale: ${error.response?.data?.message || error.message}`);
    }
  }, [fetchSales]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await axios.delete(`${API_BASE_URL}/sales/${id}`);
        await fetchSales();
      } catch (error) {
        console.error('Error deleting sale:', error);
        setError(`Failed to delete sale: ${error.response?.data?.message || error.message}`);
      }
    }
  }, [fetchSales]);

  const AddNewSale = () => {
    const navigate = useNavigate();
    return (
      <EditSaleForm 
        onSubmit={(newSale) => {
          handleEditSubmit(newSale);
          navigate('/table');
        }} 
        onCancel={() => navigate('/table')} 
      />
    );
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Chip View</Link></li>
            <li><Link to="/table">Sales Table</Link></li>
            <li><Link to="/add">Add New Sale</Link></li>
          </ul>
        </nav>

        {error && <div className="error-message">{error}</div>}

        <Routes>
          <Route path="/" element={
            <>
              <h1>Sales Dashboard</h1>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
              />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {loading ? (
                <div>Loading sales data...</div>
              ) : filteredSales.length > 0 ? (
                <ChipTable sales={filteredSales} onEdit={setEditingSale} />
              ) : (
                <div>No sales data available. {error ? `Error: ${error}` : ''}</div>
              )}
            </>
          } />
          <Route path="/table" element={
            <>
              <h1>Sales Table</h1>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
              />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {loading ? (
                <div>Loading sales data...</div>
              ) : (
                <SalesTable 
                  sales={filteredSales} 
                  onEdit={setEditingSale}
                  onDelete={handleDelete}
                />
              )}
            </>
          } />
          <Route path="/add" element={<AddNewSale />} />
        </Routes>

        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingSale(null)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;