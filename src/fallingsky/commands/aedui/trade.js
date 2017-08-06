import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from '../../config/factionIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import TradeResults from './tradeResults';

class Trade extends Command {

    static doTest(state, args) {
        const regionResults = _(state.regionsById).map(
            function (region) {
                let totalAedui = 0;
                let totalAeduiWithRoman = 0;

                const counted = _.countBy(region.piecesByFaction()[FactionIDs.AEDUI], 'type');
                totalAedui += (counted.alliedtribe || 0) + (counted.citadel || 0);

                const isAeduiControlled = region.controllingFactionId() === FactionIDs.AEDUI;
                if (isAeduiControlled) {
                    totalAedui += _.filter(
                        region.tribes(), function (tribe) {
                            return tribe.isSubdued();
                        }).length;

                    totalAeduiWithRoman = (totalAedui + _.filter(
                            region.piecesByFaction()[FactionIDs.ROMANS], function (piece) {
                                return piece.type === 'alliedtribe';
                            }).length) * 2;
                }

                if(state.hasUnshadedCapability(CapabilityIDs.RIVER_COMMERCE)) {
                    totalAedui += (counted.alliedtribe || 0) + (counted.citadel || 0);
                }

                return new TradeResults({
                    region,
                    totalAedui,
                    totalAeduiWithRoman
                });
            }).filter(
            function (regionResult) {
                return regionResult.totalAedui > 0 || regionResult.totalAeduiWithRoman > 0;
            }).value();

        _.each(
            regionResults, function (regionResult) {
                const agreementsForSupplyLine = regionResult.region.getAgreementsNeededForSupplyLine(FactionIDs.AEDUI);
                if (agreementsForSupplyLine.length === 0) {
                    regionResult.inSupplyLine = true;
                }
                regionResult.agreementsNeeded = agreementsForSupplyLine;
            });

        return regionResults;
    }
}

export default Trade;