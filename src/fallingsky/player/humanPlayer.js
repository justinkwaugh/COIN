import FallingSkyPlayer from './fallingSkyPlayer';
import AgreementRequiredError from 'common/agreementRequiredError';

class HumanPlayer extends FallingSkyPlayer {

    willHarass(factionId, context) {
        throw new AgreementRequiredError('Would you like to harass' + factionId, { factionId : factionId });
    }

    willAgreeToQuarters(factionId) {
        throw new AgreementRequiredError('Will you allow quarters' + factionId, { factionId : factionId });
    }

    willAgreeToRetreat(factionId) {
        throw new AgreementRequiredError('Will you allow retreat' + factionId, { factionId : factionId });
    }

    willAgreeToSupplyLine(factionId) {
        throw new AgreementRequiredError('Will you allow supply line' + factionId, { factionId : factionId });
    }
}

export default HumanPlayer;