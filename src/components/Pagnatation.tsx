import { useEffect, useState } from "react";
import backImg from "../images/icons8-back-50.png";
import nextImg from "../images/icons8-forward-50.png";
import doublebackImg from "../images/icons8-double-left-50.png";
import doublenextImg from "../images/icons8-double-right-50.png";
import inputArrow from "../images/icons8-expand-arrow-30.png";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
  take: number;
  onTake: (value: number) => void;
};

export const Pagination = ({
  page,
  totalPages,
  onPrev,
  onNext,
  onPage,
  take,
  onTake,
}: Props) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const safeTake = Math.max(1, take);

  const [inputValue, setInputValue] = useState(String(safeTake));

  useEffect(() => {
    setInputValue(String(safeTake));
  }, [safeTake]);

  const activeBtn =
    "rounded-md border border-[#4A5568] bg-gray-900 px-2 py-2 shadow-md hover:bg-gray-800 transition duration-200";
  const disabledBtn =
    "rounded-md border border-[#2D3748] bg-gray-900 px-1 py-1 opacity-50 cursor-not-allowed transition duration-200";

  const handleApplyTake = () => {
    const value = Number(inputValue);

    if (!Number.isNaN(value) && value > 0) {
      onTake(value);
      setInputValue(String(value));
    } else {
      setInputValue(String(safeTake));
    }
  };

  const handleDecreaseTake = () => {
    const current = Number(inputValue);
    const nextValue =
      !Number.isNaN(current) && current > 1 ? current - 1 : Math.max(1, safeTake - 1);

    setInputValue(String(nextValue));
    onTake(nextValue);
  };

  return (
    <div className="my-5 mx-2 flex flex-row flex-wrap items-center gap-5">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>

        <div className="flex items-center gap-1 rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onBlur={handleApplyTake}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyTake();
                e.currentTarget.blur();
              }
            }}
            className="w-12 bg-transparent text-white outline-none"
          />

          <button type="button" onClick={handleDecreaseTake} onChange={(e) => {
            setInputValue(e.target.value);
          }}>
            <img
              src={inputArrow}
              alt="Decrease rows"
              className="h-2 w-2"
            />
          </button>
        </div>
      </div>

      <div>
        <span>
          Page {safePage} of {safeTotalPages}
        </span>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(1)}
          disabled={safePage <= 1}
          className={safePage <= 1 ? disabledBtn : activeBtn}
        >
          <img src={doublebackImg} alt="First page" className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={onPrev}
          disabled={safePage <= 1}
          className={safePage <= 1 ? disabledBtn : activeBtn}
        >
          <img src={backImg} alt="Previous page" className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={safePage >= safeTotalPages}
          className={safePage >= safeTotalPages ? disabledBtn : activeBtn}
        >
          <img src={nextImg} alt="Next page" className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={() => onPage(safeTotalPages)}
          disabled={safePage >= safeTotalPages}
          className={safePage >= safeTotalPages ? disabledBtn : activeBtn}
        >
          <img src={doublenextImg} alt="Last page" className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};