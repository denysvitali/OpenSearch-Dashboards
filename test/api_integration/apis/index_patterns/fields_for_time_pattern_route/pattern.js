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

export default function ({ getService }) {
  const supertest = getService('supertest');
  const opensearchArchiver = getService('opensearchArchiver');

  describe('pattern', () => {
    before(() => opensearchArchiver.load('index_patterns/daily_index'));
    after(() => opensearchArchiver.unload('index_patterns/daily_index'));

    it('matches indices with compatible patterns', () =>
      supertest
        .get('/api/index_patterns/_fields_for_time_pattern')
        .query({
          pattern: '[logs-]YYYY.MM.DD',
          look_back: 2,
        })
        .expect(200)
        .then((resp) => {
          expect(resp.body).to.eql({
            fields: [
              {
                name: '@timestamp',
                type: 'date',
                opensearchTypes: ['date'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'Jan01',
                type: 'boolean',
                opensearchTypes: ['boolean'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'Jan02',
                type: 'boolean',
                opensearchTypes: ['boolean'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
            ],
          });
        }));

    it('respects look_back parameter', () =>
      supertest
        .get('/api/index_patterns/_fields_for_time_pattern')
        .query({
          pattern: '[logs-]YYYY.MM.DD',
          look_back: 1,
        })
        .expect(200)
        .then((resp) => {
          expect(resp.body).to.eql({
            fields: [
              {
                name: '@timestamp',
                type: 'date',
                opensearchTypes: ['date'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'Jan02',
                type: 'boolean',
                opensearchTypes: ['boolean'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
            ],
          });
        }));

    it('includes a field for each of `meta_fields` names', () =>
      supertest
        .get('/api/index_patterns/_fields_for_time_pattern')
        .query({
          pattern: '[logs-]YYYY.MM.DD',
          look_back: 1,
          meta_fields: JSON.stringify(['meta1', 'meta2']),
        })
        .expect(200)
        .then((resp) => {
          expect(resp.body).to.eql({
            fields: [
              {
                name: '@timestamp',
                type: 'date',
                opensearchTypes: ['date'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'Jan02',
                type: 'boolean',
                opensearchTypes: ['boolean'],
                aggregatable: true,
                searchable: true,
                readFromDocValues: true,
              },
              {
                name: 'meta1',
                type: 'string',
                aggregatable: false,
                searchable: false,
                readFromDocValues: false,
              },
              {
                name: 'meta2',
                type: 'string',
                aggregatable: false,
                searchable: false,
                readFromDocValues: false,
              },
            ],
          });
        }));
  });
}
