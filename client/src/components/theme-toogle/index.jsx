import React from "react"
import { useDispatch,useSelector } from "react-redux";
import { Select } from "antd";
import { switchTheme } from '../../redux/slices/themeSlice';

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const { currentTheme } = useSelector((state) => state.theme);
    
    return (
    <div style={{ padding: '1rem' }}>
    <Select
    value={currentTheme}
    onChange={(val) => dispatch(switchTheme(val))}
    style={{ width: 200 }}
    options={[
        { label: 'Green', value: 'clinicalClean' },
        { label: 'Dark Green', value: 'healingHarmony' },
        { label: 'Blue', value: 'modernMedical' },
        ]}
    />
    </div>
    );
    };
    
    export default ThemeToggle;