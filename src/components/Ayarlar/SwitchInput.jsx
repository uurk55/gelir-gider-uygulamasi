import React from 'react';

const SwitchInput = ({ label, ...props }) => (
    <div className="switch-container">
        <label className="switch-label">{label}</label>
        <label className="switch">
            <input type="checkbox" {...props} />
            <span className="slider round"></span>
        </label>
    </div>
);

export default SwitchInput;