import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import RaidResults from './raidResults';
import {CapabilityIDs} from '../config/capabilities';


class Raid extends Command {
    static doTest(state, args) {
        const faction = args.faction;
        return this.generateResultsForRegions(state, faction, state.regions, args.ignoreFort);
    }

    static generateResultsForRegions(state, faction, regions, ignoreFort) {
        const isGermanic = faction.id === FactionIDs.GERMANIC_TRIBES;
        return _(regions).map(
            function (region) {
                const hiddenWarbands = _.filter(region.piecesByFaction()[faction.id], function (piece) {
                        return piece.type === 'warband' && !piece.revealed();
                    });

                if (hiddenWarbands.length === 0) {
                    return;
                }

                const hasBaggageTrain = state.hasShadedCapability(CapabilityIDs.BAGGAGE_TRAINS, faction.id);
                const raidableFactions = _(region.piecesByFaction()).map(
                    function (pieces, factionId) {
                        if (factionId === faction.id || factionId === FactionIDs.GERMANIC_TRIBES) {
                            return;
                        }

                        if (state.factionsById[factionId].resources() === 0) {
                            return;
                        }

                        const hasCitadelOrFort = _.find(
                            pieces, function (piece) {
                                return piece.type === 'citadel' || (piece.type === 'fort' && !ignoreFort);
                            });

                        if (hasCitadelOrFort && !hasBaggageTrain) {
                            return;
                        }

                        return factionId;
                    }).compact().value();

                if (raidableFactions.length === 0 && (region.devastated() || isGermanic)) {
                    return;
                }

                return new RaidResults(
                    {
                        region: region,
                        faction: faction,
                        raidableFactions: raidableFactions
                    });


            }).compact().value();
    }
}

export default Raid;
