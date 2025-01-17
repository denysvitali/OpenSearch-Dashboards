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

import { pluginInitializerContextConfigMock } from '../../../../../core/server/mocks';
import {
  CollectorOptions,
  createUsageCollectionSetupMock,
} from '../../../../usage_collection/server/usage_collection.mock';

import { registerOpenSearchDashboardsUsageCollector } from './';

describe('telemetry_opensearch_dashboards', () => {
  let collector: CollectorOptions;

  const usageCollectionMock = createUsageCollectionSetupMock();
  usageCollectionMock.makeUsageCollector.mockImplementation((config) => {
    collector = config;
    return createUsageCollectionSetupMock().makeUsageCollector(config);
  });

  const legacyConfig$ = pluginInitializerContextConfigMock({}).legacy.globalConfig$;
  const callCluster = jest.fn().mockImplementation(() => ({}));

  beforeAll(() => registerOpenSearchDashboardsUsageCollector(usageCollectionMock, legacyConfig$));
  afterAll(() => jest.clearAllTimers());

  test('registered collector is set', () => {
    expect(collector).not.toBeUndefined();
    expect(collector.type).toBe('opensearchDashboards');
  });

  test('fetch', async () => {
    expect(await collector.fetch(callCluster)).toStrictEqual({
      index: '.opensearch_dashboards_tests',
      dashboard: { total: 0 },
      visualization: { total: 0 },
      search: { total: 0 },
      index_pattern: { total: 0 },
      graph_workspace: { total: 0 },
      timeline_sheet: { total: 0 },
    });
  });

  test('formatForBulkUpload', async () => {
    const resultFromFetch = {
      index: '.opensearch_dashboards_tests',
      dashboard: { total: 0 },
      visualization: { total: 0 },
      search: { total: 0 },
      index_pattern: { total: 0 },
      graph_workspace: { total: 0 },
      timeline_sheet: { total: 0 },
    };

    expect(collector.formatForBulkUpload!(resultFromFetch)).toStrictEqual({
      type: 'opensearch_dashboards_stats',
      payload: {
        usage: resultFromFetch,
      },
    });
  });
});
