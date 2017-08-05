import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';

import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import MovePieces from 'fallingsky/actions/movePieces';


class Event66 {
    static handleEvent(state) {
        const target = _(state.regions).map(region => {
            const belgicWarbands = region.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE);
            if (belgicWarbands.length === 0) {
                return;
            }

            const controlMargin = region.controllingMarginByFaction()[FactionIDs.BELGAE];
            const amountCanMove = controlMargin <= 0 ? belgicWarbands.length : Math.min(controlMargin - 1,
                                                                                        belgicWarbands.length);

            if (amountCanMove <= 0) {
                return;
            }

            const dest = _(state.regions).reject(dest => dest.controllingFactionId()).map(dest => {
                const margin = dest.controllingMarginByFaction()[FactionIDs.BELGAE];
                if ((margin + amountCanMove) < 1) {
                    return;
                }

                const subduedTribe = _(dest.subduedTribesForFaction(FactionIDs.BELGAE)).shuffle().first();
                if(!subduedTribe) {
                    return;
                }

                return {
                    region: dest,
                    tribe: subduedTribe,
                    numWarbands: Math.abs(margin) + 1
                };

            }).compact().first();

            if(!dest) {
                return;
            }

            return {
                source: region,
                destination: dest.region,
                numWarbands: dest.numWarbands,
                tribe: dest.tribe
            };
        }).compact().shuffle().first();

        if(!target) {
            return false;
        }

        const pieces = _.take(target.source.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE), target.numWarbands);
        MovePieces.execute(state, {
            sourceRegionId: target.source.id,
            destRegionId: target.destination.id,
            pieces
        });

        PlaceAlliedTribe.execute(state, {
            factionId: FactionIDs.BELGAE,
            regionId: target.destination.id,
            tribeId: target.tribe.id
        });

        return true;
    }


}

export default Event66
