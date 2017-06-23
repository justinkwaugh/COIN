import _ from '../../../lib/lodash';
import Devastate from '../../commands/arverni/devastate';

class ArverniDevastate {

    static devastate(state, modifiers) {
        let effective = false;

        const effectiveDevastations = this.getEffectiveDevastations(state, modifiers);
        _.each(effectiveDevastations, (devastation) => {
            Devastate.execute(state, {
                devastation
            });
            effective = true;
        });

        return effective;
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