import _ from '../../../lib/lodash';
import Besiege from '../../commands/romans/besiege';
import SpecialAbilityIDs from '../../config/specialAbilityIds';

class RomanBesiege {

    static besiege(state, modifiers) {
        const battles = modifiers.context.battles;

        const effectiveBesieges = _(Besiege.test(state, {
            battles: battles
        })).filter(result => result.willRemoveExtraAlly || result.willRemoveExtraCitadel).value();

        if(effectiveBesieges.length === 0) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.BESIEGE);
        _.each(battles, (battle) => {
            battle.willBesiege = true;
        });
        state.turnHistory.getCurrentTurn().commitSpecialAbility();


        return true;
    }
}

export default RomanBesiege;