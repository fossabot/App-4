import React from "react";
import PropTypes from "prop-types";
//Styles
import styled from "styled-components";

const Switch = ({ className, value, square, onChange }) => {
  return (
    <label className={className}>
      <input
        type="checkbox"
        onChange={() => onChange(!value)}
        checked={value}
      />
      <span className={`slider ${square ? "" : "round"}`}>&zwnj;</span>
    </label>
  );
};

Switch.defaultProps = {
  square: false
};

Switch.propTypes = {
  square: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

export default styled(Switch)`
  /* The switch - the box around the slider */
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-bottom: 0;

  /* Hide default HTML checkbox */
  input {
    display: none;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: ${props =>
      props.color ? props.color : props.theme.color.primary};
  }

  input:focus + .slider {
    box-shadow: 0 0 1px
      ${props => (props.color ? props.color : props.theme.color.primary)};
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
`;
