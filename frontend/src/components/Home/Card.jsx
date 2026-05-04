import React from "react";
import styled from "styled-components";

const Card = ({ title, description }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="flex flex-col p-5 justify-center items-center z-2">
          <h2 className="text-white text-xl sm:text-2xl font-semibold">{title}</h2>
          <p className="text-gray-300 text-xs sm:text-lg">{description}</p>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
@media only screen and (min-width:1400px){
.card{
min-height:250px}
}
  .card {
    width: 100%;
    height: 100%;
    background: #07182e;
    position: relative;
    display: flex;
    padding: 20px;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    overflow: hidden;
  }

  /* Moving border line */
  .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      transparent 25%,
      rgb(46, 210, 24) 30%,
      transparent 35%,
      transparent 60%,
      rgb(46, 210, 24) 65%,
      transparent 70%,
      transparent 100%
    );
    animation: borderRotate 4s linear infinite;
    border-radius: inherit;
    z-index: 1;
  }

  @keyframes borderRotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .card::after {
    content: "";
    position: absolute;
    inset: 3px;
    background: linear-gradient(135deg, #374151, #111827);
    border-radius: 17px;
    z-index: 1;
  }
`;

export default Card;
