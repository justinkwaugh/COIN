import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import TurnContext from 'common/turnContext';
import Battle from 'fallingsky/commands/battle';

class Event51 {
    static handleEvent(state) {
        if (state.germanic.availableWarbands().length === 0) {
            return false;
        }

        _(state.regions).shuffle().filter(
            region => region.id === RegionIDs.TREVERI || _.find(region.adjacent,
                                                                adjacent => adjacent.id === RegionIDs.TREVERI)).filter(
            region => region.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length > 0).map(region => {
            const warbands = region.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI);

        });

        return false;
    }
}

export default Event51
