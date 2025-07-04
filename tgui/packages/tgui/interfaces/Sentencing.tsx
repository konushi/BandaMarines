import { useState } from 'react';
import { useBackend } from 'tgui/backend';
import { Box, Button, Flex, LabeledList, Section, Tabs } from 'tgui/components';
import { Window } from 'tgui/layouts';

const PAGES = {
  main: () => MainMenu,
  incident_report: () => NewReport,
  new_charge: () => NewCharge,
};

type Law = {
  name: String;
  desc: String;
  brig_time: number;
  special_punishment: string;
  conditions: string;
  ref: string;
};

type IncidentData = {
  suspect_name: string;
  summary: string;
  sentence: string;
  current_charges: {
    name: String;
    desc: string;
    special_punishment: string;
    ref: string;
  }[];
  evidence: { name: string; notes: string; ref: string }[];
  witnesses: { name: string; notes: string; ref: string }[];
};

type Data = {
  current_menu: string;
  laws: { laws: Law[]; label: string }[];
} & Partial<IncidentData>;

export const Sentencing = (props) => {
  const { data } = useBackend<Data>();
  const { current_menu } = data;
  const PageComponent = PAGES[current_menu]();

  return (
    <Window theme="weyland" width={780} height={725}>
      <Window.Content scrollable>
        <PageComponent />
      </Window.Content>
    </Window>
  );
};

const MainMenu = (props) => {
  const { act } = useBackend<Data>();

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      height="100%"
      color="darkgrey"
      fontSize="2rem"
      mt="-3rem"
      bold
    >
      <Box fontFamily="monospace">
        Юрисдикционная Автоматизированная Система
      </Box>
      <Box mb="2rem" fontFamily="monospace">
        WY-DOS Executive
      </Box>
      <Box fontFamily="monospace">Version 5.8.4</Box>
      <Box fontFamily="monospace">Copyright © 2182, Вейланд Ютани Корп.</Box>

      <Button
        width="30vw"
        textAlign="center"
        fontSize="1.5rem"
        p="1rem"
        mt="5rem"
        onClick={() => act('new_report')}
      >
        Новый отчет
      </Button>
      <Box fontSize="2rem" mt="1rem">
        ИЛИ
      </Box>
      <Box fontSize="1.5rem" mt="1rem">
        просканировать существующий отчет
      </Box>
    </Flex>
  );
};

const NewReport = (props) => {
  const { data, act } = useBackend<Data>();
  const { suspect_name, summary, sentence, current_charges = [] } = data;
  const canExport = suspect_name && current_charges.length;

  return (
    <>
      <Section>
        <Flex align="center">
          <Button.Confirm
            icon="arrow-left"
            px="2rem"
            textAlign="center"
            mr="1rem"
            tooltip="Delete report"
            onClick={() => act('scrap_report')}
          />

          <h1>Отчет об инциденте</h1>

          <Button
            icon="print"
            ml="auto"
            px="2rem"
            bold
            tooltip={canExport ? '' : 'Отсутствует обвиняемый или обвинения'}
            disabled={!canExport}
            onClick={() => act('export')}
          >
            Экспорт
          </Button>
        </Flex>
      </Section>
      <Section>
        <LabeledList>
          <LabeledList.Item label="Обвиняемый">
            <Button
              icon="pen"
              bold
              tooltip="Держите ID в руке"
              onClick={() => act('set_suspect')}
            >
              {suspect_name}
            </Button>
          </LabeledList.Item>
          <LabeledList.Item label="Заключение">
            {sentence !== '0 минут' ? sentence : '--'}
          </LabeledList.Item>
          <LabeledList.Item label="Описание">
            <Button icon="pen" onClick={() => act('edit_summary')} />
          </LabeledList.Item>
        </LabeledList>
        <Box mt=".5rem" italic>
          {summary}
        </Box>
      </Section>

      <Charges />

      <Evidence />
    </>
  );
};

const NewCharge = (props) => {
  const { data, act } = useBackend<Data>();
  const { laws } = data;
  const [chargeCategory, setChargeCategory] = useState(0);

  return (
    <>
      <Section>
        <Flex align="center">
          <Button
            icon="arrow-left"
            px="2rem"
            textAlign="center"
            mr="1rem"
            onClick={() => act('set_menu', { new_menu: 'incident_report' })}
          />
          <h1>Новое обвинение</h1>
        </Flex>
      </Section>
      <Section>
        <Tabs fluid textAlign="center">
          {laws.map((category, i) => (
            <Tabs.Tab
              key={i}
              selected={i === chargeCategory}
              onClick={() => setChargeCategory(i)}
            >
              {category.label}
            </Tabs.Tab>
          ))}
        </Tabs>

        <Section>
          {laws[chargeCategory].laws.map((law, i) => (
            <Section key={i} title={law.name}>
              <Box mb=".75rem" italic>
                {law.desc}
              </Box>
              <LabeledList>
                <LabeledList.Item label="Заключение">
                  {law.brig_time} минут
                </LabeledList.Item>
                {law.special_punishment && (
                  <LabeledList.Item label="Дополнительно">
                    {law.special_punishment}
                  </LabeledList.Item>
                )}
                {law.conditions && (
                  <LabeledList.Item label="Conditions">
                    {law.conditions}
                  </LabeledList.Item>
                )}
              </LabeledList>
              <Button
                bold
                mt="1rem"
                onClick={() => act('new_charge', { law: law.ref })}
              >
                Добавить обвинение
              </Button>
            </Section>
          ))}
        </Section>
      </Section>
    </>
  );
};

const Charges = (props) => {
  const { data, act } = useBackend<Data>();
  const { current_charges = [] } = data;

  return (
    <Section title="Обвинения">
      <Flex direction="column">
        {!!current_charges.length && (
          <Flex
            className="candystripe"
            p=".75rem"
            align="center"
            fontSize="1.25rem"
          >
            <Flex.Item bold width="9rem" shrink="0" mr="1rem">
              Обвинение
            </Flex.Item>
            <Flex.Item grow bold>
              Описание
            </Flex.Item>
            <Flex.Item
              width="10rem"
              shrink="0"
              textAlign="right"
              pr="3rem"
              bold
            >
              Дополнительно
            </Flex.Item>
          </Flex>
        )}
        {current_charges.map((charge, i) => {
          return (
            <Flex key={i} className="candystripe" p=".75rem" align="center">
              <Flex.Item bold width="9rem" shrink="0" mr="1rem">
                {charge.name}
              </Flex.Item>
              <Flex.Item grow italic>
                {charge.desc}
              </Flex.Item>
              <Flex.Item width="9rem" ml="1rem" shrink="0" textAlign="right">
                {charge.special_punishment}
              </Flex.Item>
              <Flex.Item ml="1rem">
                <Button
                  icon="trash"
                  onClick={() => act('remove_charge', { charge: charge.ref })}
                />
              </Flex.Item>
            </Flex>
          );
        })}
        <Flex justify="center" mt=".75rem">
          <Button
            px="2rem"
            py=".25rem"
            mb=".5rem"
            bold
            onClick={() => act('set_menu', { new_menu: 'new_charge' })}
          >
            Новое обвинение
          </Button>
        </Flex>
      </Flex>
    </Section>
  );
};

const Evidence = (props) => {
  const { data, act } = useBackend<Data>();
  const { witnesses = [], evidence = [] } = data;

  return (
    <Section title="Доказательства">
      <Flex>
        {/* Witnesses */}
        <Flex direction="column" width="50%">
          {witnesses.map((witness, i) => (
            <Flex
              key={i}
              className="candystripe"
              p=".75rem"
              mb=".75rem"
              align="center"
            >
              <Flex direction="column" align="middle" width="100%">
                <Flex.Item bold mb=".5rem">
                  {witness.name}
                </Flex.Item>

                <Flex.Item italic>{witness.notes}</Flex.Item>
              </Flex>

              <Flex
                direction="column"
                width="2.5rem"
                textAlign="center"
                ml="1rem"
              >
                <Button
                  icon="pen"
                  width="100%"
                  onClick={() =>
                    act('edit_witness_notes', { witness: witness.ref })
                  }
                />
                <Button
                  icon="trash"
                  width="100%"
                  onClick={() =>
                    act('remove_witness', { witness: witness.ref })
                  }
                />
              </Flex>
            </Flex>
          ))}
          <Button
            textAlign="center"
            bold
            width="50%"
            mx="auto"
            py=".25rem"
            tooltip="Держите ID в руке"
            onClick={() => act('add_witness')}
          >
            Добавить свидетеля
          </Button>
        </Flex>

        {/* Objects */}
        <Flex direction="column" width="50%">
          {evidence.map((evidence, i) => (
            <Flex
              key={i}
              className="candystripe"
              p=".75rem"
              mb=".75rem"
              align="center"
            >
              <Flex direction="column" align="middle" width="100%">
                <Flex.Item bold mb=".5rem">
                  {evidence.name}
                </Flex.Item>

                <Flex.Item italic>{evidence.notes}</Flex.Item>
              </Flex>

              <Flex
                direction="column"
                width="2.5rem"
                textAlign="center"
                ml="1rem"
              >
                <Button
                  icon="pen"
                  width="100%"
                  onClick={() =>
                    act('edit_evidence_notes', { evidence: evidence.ref })
                  }
                />
                <Button
                  icon="trash"
                  width="100%"
                  onClick={() =>
                    act('remove_evidence', { evidence: evidence.ref })
                  }
                />
              </Flex>
            </Flex>
          ))}
          <Button
            textAlign="center"
            bold
            width="50%"
            mx="auto"
            py=".25rem"
            tooltip="Держите предмет в руке"
            onClick={() => act('add_evidence')}
          >
            Добавить доказательства
          </Button>
        </Flex>
      </Flex>
    </Section>
  );
};
