import _ from '../../../lib/lodash';
import Devastate from '../../commands/arverni/devastate';
import SpecialAbilityIDs from '../../config/specialAbilityIds';

class ArverniDevastate {

    static devastate(state, modifiers) {

        const effectiveDevastations = this.getEffectiveDevastations(state, modifiers);
        if(modifiers.test) {
            return effectiveDevastations;
        }

        if(effectiveDevastations.length === 0) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.DEVASTATE);
        _.each(effectiveDevastations, (devastation) => {
            Devastate.execute(state, {
                devastation
            });
        });
        state.turnHistory.getCurrentTurn().commitSpecialAbility();

        return true;
    }

    static getEffectiveDevastations(state, modifiers) {
        return _.filter(
            Devastate.test(state), (possibleDevastation) => {
                const romanRemovals = possibleDevastation.removedRomans;
                if(_.find(romanRemovals, {type: 'legion'})) {
                    return true;
                }
                const aeduiRemovals = possibleDevastation.removedAedui;
                const arverniRemovals = possibleDevastation.removedArverni;
                return (romanRemovals.length + aeduiRemovals.length) > 0 && (romanRemovals.length + aeduiRemovals.length >= arverniRemovals.length);

            });

    }
}

export default ArverniDevastate;