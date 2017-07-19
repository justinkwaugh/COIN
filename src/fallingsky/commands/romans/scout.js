import _ from '../../../lib/lodash';
import Command from '../command';
import RegionIDs from 'fallingsky/config/regionIds';
import FactionIDs from 'fallingsky/config/factionIds';
import ScoutResults from './scoutResults';

class Scout extends Command {

    static doTest(state, args) {
        return _(state.regions).filter(region=> region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length > 0).map((region) => {
            const moveRegions = region.id === RegionIDs.BRITANNIA ? [] : _.reject(region.adjacent, {id: RegionIDs.BRITANNIA});
            return new ScoutResults({
                                        region,
                                        moveRegions
                                    });

        }).value();
    }
}

export default Scout;