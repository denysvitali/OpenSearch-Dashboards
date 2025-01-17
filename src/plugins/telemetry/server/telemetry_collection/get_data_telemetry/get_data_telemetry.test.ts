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

import { buildDataTelemetryPayload, getDataTelemetry } from './get_data_telemetry';
import { DATA_DATASETS_INDEX_PATTERNS, DATA_DATASETS_INDEX_PATTERNS_UNIQUE } from './constants';
import { opensearchServiceMock } from '../../../../../../src/core/server/mocks';

describe.skip('get_data_telemetry', () => {
  describe.skip('DATA_DATASETS_INDEX_PATTERNS', () => {
    DATA_DATASETS_INDEX_PATTERNS.forEach((entry, index, array) => {
      describe.skip(`Pattern ${entry.pattern}`, () => {
        test('there should only be one in DATA_DATASETS_INDEX_PATTERNS_UNIQUE', () => {
          expect(
            DATA_DATASETS_INDEX_PATTERNS_UNIQUE.filter(({ pattern }) => pattern === entry.pattern)
          ).toHaveLength(1);
        });

        // This test is to make us sure that we don't update one of the duplicated entries and forget about any other repeated ones
        test('when a document is duplicated, the duplicates should be identical', () => {
          array.slice(0, index).forEach((previousEntry) => {
            if (entry.pattern === previousEntry.pattern) {
              expect(entry).toStrictEqual(previousEntry);
            }
          });
        });
      });
    });
  });

  describe.skip('buildDataTelemetryPayload', () => {
    test('return the base object when no indices provided', () => {
      expect(buildDataTelemetryPayload([])).toStrictEqual([]);
    });

    test('return the base object when no matching indices provided', () => {
      expect(
        buildDataTelemetryPayload([
          { name: 'no__way__this__can_match_anything', sizeInBytes: 10 },
          { name: '.opensearch_dashboards-event-log-8.0.0' },
        ])
      ).toStrictEqual([]);
    });

    test('matches some indices and puts them in their own category', () => {
      expect(
        buildDataTelemetryPayload([
          // APM Indices have known shipper (so we can infer the dataStreamType from mapping constant)
          { name: 'apm-7.7.0-error-000001', shipper: 'apm', isECS: true },
          { name: 'apm-7.7.0-metric-000001', shipper: 'apm', isECS: true },
          { name: 'apm-7.7.0-onboarding-2020.05.17', shipper: 'apm', isECS: true },
          { name: 'apm-7.7.0-profile-000001', shipper: 'apm', isECS: true },
          { name: 'apm-7.7.0-span-000001', shipper: 'apm', isECS: true },
          { name: 'apm-7.7.0-transaction-000001', shipper: 'apm', isECS: true },
          // Packetbeat indices with known shipper (we can infer dataStreamType from mapping constant)
          { name: 'packetbeat-7.7.0-2020.06.11-000001', shipper: 'packetbeat', isECS: true },
          // Matching patterns from the list => known dataStreamDataset but the rest is unknown
          { name: 'filebeat-12314', docCount: 100, sizeInBytes: 10 },
          { name: 'metricbeat-1234', docCount: 100, sizeInBytes: 10, isECS: false },
          { name: '.app-search-1234', docCount: 0 },
          { name: 'logs-endpoint.1234', docCount: 0 }, // Matching pattern with a dot in the name
          // New Indexing strategy: everything can be inferred from the constant_keyword values
          {
            name: '.ds-logs-nginx.access-default-000001',
            dataStreamDataset: 'nginx.access',
            dataStreamType: 'logs',
            shipper: 'filebeat',
            isECS: true,
            docCount: 1000,
            sizeInBytes: 1000,
          },
          {
            name: '.ds-logs-nginx.access-default-000002',
            dataStreamDataset: 'nginx.access',
            dataStreamType: 'logs',
            shipper: 'filebeat',
            isECS: true,
            docCount: 1000,
            sizeInBytes: 60,
          },
          {
            name: '.ds-traces-something-default-000002',
            dataStreamDataset: 'something',
            dataStreamType: 'traces',
            packageName: 'some-package',
            isECS: true,
            docCount: 1000,
            sizeInBytes: 60,
          },
          {
            name: '.ds-metrics-something.else-default-000002',
            dataStreamDataset: 'something.else',
            dataStreamType: 'metrics',
            managedBy: 'ingest-manager',
            isECS: true,
            docCount: 1000,
            sizeInBytes: 60,
          },
          // Filter out if it has dataStreamDataset and dataStreamType but none of the shipper, packageName or managedBy === 'ingest-manager'
          {
            name: 'some-index-that-should-not-show',
            dataStreamDataset: 'should-not-show',
            dataStreamType: 'logs',
            isECS: true,
            docCount: 1000,
            sizeInBytes: 60,
          },
          {
            name: 'other-index-that-should-not-show',
            dataStreamDataset: 'should-not-show-either',
            dataStreamType: 'metrics',
            managedBy: 'me',
            isECS: true,
            docCount: 1000,
            sizeInBytes: 60,
          },
        ])
      ).toStrictEqual([
        {
          shipper: 'apm',
          index_count: 6,
          ecs_index_count: 6,
        },
        {
          shipper: 'packetbeat',
          index_count: 1,
          ecs_index_count: 1,
        },
        {
          pattern_name: 'filebeat',
          shipper: 'filebeat',
          index_count: 1,
          doc_count: 100,
          size_in_bytes: 10,
        },
        {
          pattern_name: 'metricbeat',
          shipper: 'metricbeat',
          index_count: 1,
          ecs_index_count: 0,
          doc_count: 100,
          size_in_bytes: 10,
        },
        {
          pattern_name: 'app-search',
          index_count: 1,
          doc_count: 0,
        },
        {
          pattern_name: 'logs-endpoint',
          shipper: 'endpoint',
          index_count: 1,
          doc_count: 0,
        },
        {
          data_stream: { dataset: 'nginx.access', type: 'logs' },
          shipper: 'filebeat',
          index_count: 2,
          ecs_index_count: 2,
          doc_count: 2000,
          size_in_bytes: 1060,
        },
        {
          data_stream: { dataset: 'something', type: 'traces' },
          package: { name: 'some-package' },
          index_count: 1,
          ecs_index_count: 1,
          doc_count: 1000,
          size_in_bytes: 60,
        },
        {
          data_stream: { dataset: 'something.else', type: 'metrics' },
          index_count: 1,
          ecs_index_count: 1,
          doc_count: 1000,
          size_in_bytes: 60,
        },
      ]);
    });
  });

  describe.skip('getDataTelemetry', () => {
    test('it returns the base payload (all 0s) because no indices are found', async () => {
      const opensearchClient = mockOpenSearchClient();
      await expect(getDataTelemetry(opensearchClient)).resolves.toStrictEqual([]);
      expect(opensearchClient.indices.getMapping).toHaveBeenCalledTimes(1);
      expect(opensearchClient.indices.stats).toHaveBeenCalledTimes(1);
    });

    test('can only see the index mappings, but not the stats', async () => {
      const opensearchClient = mockOpenSearchClient(['filebeat-12314']);
      await expect(getDataTelemetry(opensearchClient)).resolves.toStrictEqual([
        {
          pattern_name: 'filebeat',
          shipper: 'filebeat',
          index_count: 1,
          ecs_index_count: 0,
        },
      ]);
      expect(opensearchClient.indices.getMapping).toHaveBeenCalledTimes(1);
      expect(opensearchClient.indices.stats).toHaveBeenCalledTimes(1);
    });

    test('can see the mappings and the stats', async () => {
      const opensearchClient = mockOpenSearchClient(
        ['filebeat-12314'],
        { isECS: true },
        {
          indices: {
            'filebeat-12314': { total: { docs: { count: 100 }, store: { size_in_bytes: 10 } } },
          },
        }
      );
      await expect(getDataTelemetry(opensearchClient)).resolves.toStrictEqual([
        {
          pattern_name: 'filebeat',
          shipper: 'filebeat',
          index_count: 1,
          ecs_index_count: 1,
          doc_count: 100,
          size_in_bytes: 10,
        },
      ]);
    });

    test('find an index that does not match any index pattern but has mappings metadata', async () => {
      const opensearchClient = mockOpenSearchClient(
        ['cannot_match_anything'],
        { isECS: true, dataStreamType: 'traces', shipper: 'my-beat' },
        {
          indices: {
            cannot_match_anything: {
              total: { docs: { count: 100 }, store: { size_in_bytes: 10 } },
            },
          },
        }
      );
      await expect(getDataTelemetry(opensearchClient)).resolves.toStrictEqual([
        {
          data_stream: { dataset: undefined, type: 'traces' },
          shipper: 'my-beat',
          index_count: 1,
          ecs_index_count: 1,
          doc_count: 100,
          size_in_bytes: 10,
        },
      ]);
    });

    test('return empty array when there is an error', async () => {
      const opensearchClient = opensearchServiceMock.createClusterClient().asInternalUser;
      opensearchClient.indices.getMapping.mockRejectedValue(
        new Error('Something went terribly wrong')
      );
      opensearchClient.indices.stats.mockRejectedValue(new Error('Something went terribly wrong'));
      await expect(getDataTelemetry(opensearchClient)).resolves.toStrictEqual([]);
    });
  });
});
function mockOpenSearchClient(
  indicesMappings: string[] = [], // an array of `indices` to get mappings from.
  { isECS = false, dataStreamDataset = '', dataStreamType = '', shipper = '' } = {},
  indexStats: any = {}
) {
  const opensearchClient = opensearchServiceMock.createClusterClient().asInternalUser;
  // @ts-ignore
  opensearchClient.indices.getMapping.mockImplementationOnce(async () => {
    const body = Object.fromEntries(
      indicesMappings.map((index) => [
        index,
        {
          mappings: {
            ...(shipper && { _meta: { beat: shipper } }),
            properties: {
              ...(isECS && { ecs: { properties: { version: { type: 'keyword' } } } }),
              ...((dataStreamType || dataStreamDataset) && {
                data_stream: {
                  properties: {
                    ...(dataStreamDataset && {
                      dataset: { type: 'constant_keyword', value: dataStreamDataset },
                    }),
                    ...(dataStreamType && {
                      type: { type: 'constant_keyword', value: dataStreamType },
                    }),
                  },
                },
              }),
            },
          },
        },
      ])
    );
    return { body };
  });
  // @ts-ignore
  opensearchClient.indices.stats.mockImplementationOnce(async () => {
    return { body: indexStats };
  });
  return opensearchClient;
}
