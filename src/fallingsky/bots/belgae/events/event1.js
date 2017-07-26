import ChangeSenateApproval from 'fallingsky/actions/changeSenateApproval';
import {SenateApprovalStates} from 'fallingsky/config/senateApprovalStates';

class Event1 {
    static handleEvent(state) {
        const currentApprovalState = state.senateApprovalState();
        const currentFirm = state.senateFirm();

        let approvalState = currentApprovalState;
        let isFirm = currentFirm;

        if (currentApprovalState === SenateApprovalStates.UPROAR && currentFirm) {
            return false;
        }
        else if (currentApprovalState === SenateApprovalStates.UPROAR) {
            isFirm = true;
        }
        else if (currentApprovalState === SenateApprovalStates.ADULATION && currentFirm) {
            isFirm = false;
        }
        else {
            approvalState -= 1;
        }

        ChangeSenateApproval.execute(state, {
            approvalState,
            isFirm
        });

        return true;
    }
}

export default Event1
