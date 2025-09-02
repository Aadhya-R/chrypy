import { useState } from "react";

const InputField = ({ 
  type, 
  placeholder, 
  icon, 
  name, 
  value, 
  onChange, 
  required = false 
}) => {
  // State to toggle password visibility
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="input-wrapper">
      <input
        type={isPasswordShown ? 'text' : type}
        name={name}
        placeholder={placeholder}
        className="input-field"
        value={value || ''}
        onChange={handleChange}
        required={required}
      />
      <i className="material-symbols-rounded">{icon}</i>
      {type === 'password' && (
        <button 
          type="button"
          onClick={() => setIsPasswordShown(prevState => !prevState)} 
          className="eye-button"
          aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
        >
          <i className="material-symbols-rounded">
            {isPasswordShown ? 'visibility' : 'visibility_off'}
          </i>
        </button>
      )}
    </div>
  )
}

export default InputField;