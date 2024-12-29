import { PLATFORM_FEE_PERCENT } from "@/utils/environment";
import Modal from "./Modal";

const HowToPredictModal = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 rounded-lg shadow-lg">
              <h2 className="text-primary text-xl font-bold mb-4">
                How to Predict
              </h2>
              <div className="mb-4 overflow-y-scroll h-80">
                <h3 className="text-primary font-bold">
                  Step 1: Connect wallet
                </h3>
                <p className="text-gray-500 pb-4">
                  Visit the Prediction Market platform. Click Connect Wallet
                  button if you have not connected on Core blockchain.
                </p>
                <h3 className="text-primary font-bold">
                  Step 2: Explore Active Predictions
                </h3>
                <p className="text-gray-500 pb-4">
                  Navigate to the Prediction Market homepage. Browse the list of
                  active predictions to find topics that interest you (e.g.,
                  sports, finance, crypto, or global events).
                </p>
                <h3 className="text-primary font-bold">
                  Step 3: Place Your Prediction
                </h3>
                <p className="text-gray-500 pb-4">
                  Click on a prediction to view its details, such as the
                  question, outcomes, rules, and closing time. Choose your
                  prediction from the available options (e.g., &quot;Yes&quot;
                  or &quot;No&quot;). Enter the amount you want to predict and
                  confirm your prediction.
                </p>
                <h3 className="text-primary font-bold">
                  Step 4: Monitor Your Predictions
                </h3>
                <p className="text-gray-500 pb-4">
                  After placing a prediction, it will appear in your dashboard.
                  Track the market's progress and stay updated with live data.
                </p>
                <h3 className="text-primary font-bold">
                  Step 5: Claim Rewards
                </h3>
                <p className="text-gray-500 pb-4">
                  If your prediction is correct, you will earn the rewards as
                  (total amount of user predicted)/(total amount of all users
                  predicted for correct outcome) * (total amount of all users
                  predicted for whole prediction) * {100 - PLATFORM_FEE_PERCENT}
                  %. Platform fee is {PLATFORM_FEE_PERCENT}%.
                </p>
                <p className="text-gray-500 pb-4">
                  You have to claim your rewards by going to the prediction that
                  you predicted and click Claim Rewards button and confirm.
                </p>
                <h3 className="text-primary font-bold">Step 6: Reinvest</h3>
                <p className="text-gray-500 pb-4">
                  Go to other predictions and reinvest them into new
                  predictions. Diversify your predictions to maximize earning
                  potential.
                </p>
              </div>
            </div>
          </Modal>
        </div>
      ) : null}
    </>
  );
};

export default HowToPredictModal;
