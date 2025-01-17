/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import expect from '@osd/expect';

export default function ({ getService, getPageObjects }) {
  const PageObjects = getPageObjects(['common', 'visualize', 'timePicker']);
  const opensearchArchiver = getService('opensearchArchiver');
  const opensearchDashboardsServer = getService('opensearchDashboardsServer');
  const inspector = getService('inspector');

  const STATS_ROW_NAME_INDEX = 0;
  const STATS_ROW_VALUE_INDEX = 1;
  function getHitCount(requestStats) {
    const hitsCountStatsRow = requestStats.find((statsRow) => {
      return statsRow[STATS_ROW_NAME_INDEX] === 'Hits (total)';
    });
    return hitsCountStatsRow[STATS_ROW_VALUE_INDEX];
  }

  // FLAKY: https://github.com/elastic/kibana/issues/39842
  describe.skip('inspect', () => {
    before(async () => {
      await opensearchArchiver.loadIfNeeded('logstash_functional');
      await opensearchArchiver.load('discover');
      // delete .opensearch_dashboards index and update configDoc
      await opensearchDashboardsServer.uiSettings.replace({
        defaultIndex: 'logstash-*',
      });

      await PageObjects.common.navigateToApp('discover');
    });

    afterEach(async () => {
      await inspector.close();
    });

    it('should display request stats with no results', async () => {
      await inspector.open();
      const requestStats = await inspector.getTableData();

      expect(getHitCount(requestStats)).to.be('0');
    });

    it('should display request stats with results', async () => {
      await PageObjects.timePicker.setDefaultAbsoluteRange();

      await inspector.open();
      const requestStats = await inspector.getTableData();

      expect(getHitCount(requestStats)).to.be('14004');
    });
  });
}
