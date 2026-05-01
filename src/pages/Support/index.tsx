import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AttachFile,
  ExpandMore,
  InfoOutlined,
  Search,
  Send,
} from '@mui/icons-material';
import { useNotification } from '@hooks/useNotification';

interface FaqItem {
  id: number;
  title: string;
  answer: string;
  enTitle: string;
  enAnswer: string;
}

const faqItems: FaqItem[] = [
  {
    id: 1,
    title: 'O que e a ficha tecnica de uma receita?',
    answer:
      'A ficha tecnica e uma ferramenta/documento de controle fundamental para quem trabalha com gastronomia. E com ela que voce calcula o custo exato das suas receitas e de cada ingrediente. Ajuda a manter o padrao dos pratos criando processos bem definidos para executar a receita. Ajuda a evitar desperdicios calculando exatamente a quantidade de cada ingrediente voce vai precisar na sua operacao e muito mais. Tambem e com ela que voce tem as informacoes nutricionais das receitas. Ajuda a melhorar a operacao. E a bussola de qualquer negocio de gastronomia! <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/1_tutorial_receita.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/1_tutorial_receita.pdf">(saiba mais)</a>',
    enTitle: "What is a recipe`s technical sheet?",
    enAnswer:
      'The technical sheet is a fundamental control tool / document for those who work with gastronomy. It is with it that you calculate the exact cost of your recipes and each ingredient. Helps maintain the pattern of the dishes by creating well-defined processes for executing the recipe. It helps to avoid waste by calculating exactly the amount of each ingredient you will need in your operation and more. It is also with it that you have the nutrition facts of the recipes. Helps to improve the operation. It is the compass of any gastronomy business! <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/1_tutorial_receita.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/1_tutorial_receita.pdf">(know more)</a>',
  },
  {
    id: 2,
    title: 'Como criar uma ficha tecnica?',
    answer:
      'Com o ChefPro e simples de voce criar suas fichas tecnicas, mante-las organizadas e atualizadas. Separamos um passo a passo de como criar da melhor forma. E se voce continuar com qualquer duvida, pode entrar em contato com a gente sempre que precisar! Link <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/2_tutorial_como_criar_uma_ficha_tecnica.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/2_tutorial_como_criar_uma_ficha_tecnica.pdf">(saiba mais)</a>',
    enTitle: 'How to create a technical sheet?',
    enAnswer:
      'With ChefPro it is simple for you to create your data sheets, keep them organized and up to date. We separated step by step on how to create the best way. And if you continue with any questions, you can contact us whenever you need! Link <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/2_tutorial_como_criar_uma_ficha_tecnica.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/2_tutorial_como_criar_uma_ficha_tecnica.pdf">(know more)</a>',
  },
  {
    id: 3,
    title: 'O que e o fator de correcao e como calcular as perdas dos ingredientes?',
    answer:
      'O fator de correcao e o calculo utilizado para voce saber as perdas de cada ingrediente. Como por exemplo quando voce compra o camarao inteiro, mas sua receita utiliza ele limpo (sem cabeca, casca e visceras) essas perdas devem ser consideradas. Saiba mais para ver como calcular a formula e como utilizar o fator de correcao no chefpro. Link <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/3_tutorial_fator_de_correcao.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/3_tutorial_fator_de_correcao.pdf">(saiba mais)</a>',
    enTitle: 'What is the correction factor and how to calculate ingredient losses?',
    enAnswer:
      'The correction factor is the calculation used to let you know the losses of each ingredient. As for example when you buy the whole shrimp, but your recipe uses it clean (without head, skin and offal) these losses must be considered. Learn more to see how to calculate the formula and how to use the correction factor in chefpro. Link <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/3_tutorial_fator_de_correcao.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/3_tutorial_fator_de_correcao.pdf">(know more)</a>',
  },
  {
    id: 4,
    title: 'O que e ingrediente composto?',
    answer:
      'Ingrediente composto e uma receita que e utilizada como ingrediente em outra receita! Como um molho ou uma massa de pizza, que tem um preparo com varios ingredientes, mas e utilizada como ingrediente de outra receita. Ou seja, e um ingrediente que e composto de mais de um ingrediente. No ChefPro voce pode utilizar qualquer receita como ingrediente em outra, basta buscar pelo nome da receita no momento de adicionar os ingredientes em uma nova receita. Para entender melhor como utilizar isso da melhor forma clique aqui. <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/4_tutorial_ingrediente_composto.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/4_tutorial_ingrediente_composto.pdf">(saiba mais)</a>',
    enTitle: 'What is a compound ingredient?',
    enAnswer:
      'Compound ingredient is a recipe that is used as an ingredient in another recipe! Like a sauce or pizza dough, it has a preparation with several ingredients, but is used as an ingredient in another recipe. That is, it is an ingredient that is composed of more than one ingredient. In ChefPro you can use any recipe as an ingredient in another, just search for the recipe name when adding the ingredients in a new recipe. To better understand how to use this in the best way click here. <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/4_tutorial_ingrediente_composto.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/4_tutorial_ingrediente_composto.pdf">(know more)</a>',
  },
  {
    id: 5,
    title: 'Qual a diferenca entre margem de lucro e markup?',
    answer:
      'Margem de lucro e a porcentagem de lucro que voce teve em cima do preco de venda. Ex. Um produto vendido a 100 reais e 20 reais e o lucro. A margem de lucro e 20%. Markup e o indice (ou porcentagem) que voce soma ao preco de custo para saber o valor de venda. Ex. O custo do produto e 10 reais e eu somo 300% para ter o preco de venda de 40 reais. Lembre-se que existem varios tipos de margem de lucro, para saber mais clique aqui. <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/5_tutorial_markup.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/5_tutorial_markup.pdf">(saiba mais)</a>',
    enTitle: 'What is the difference between profit margin and markup?',
    enAnswer:
      'Profit margin is the percentage of profit you made over the sale price. Ex. A product sold for 100 reais and 20 reais is profit. The profit margin is 20%. Markup is the index (or percentage) that you add to the cost price to find out the sales value. Ex. The cost of the product is 10 reais and I add 300% to have the selling price of 40 reais. Remember that there are several types of profit margin, to learn more click here. <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/5_tutorial_markup.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/5_tutorial_markup.pdf">(know more)</a>',
  },
  {
    id: 6,
    title: 'O que e a ficha tecnica de um cardapio?',
    answer:
      'Quando voce vai fazer um evento, um jantar, um menu especial, alem de calcular o custo de cada receita, voce deve calcular o custo do evento como um todo, colocando os outros custos do evento alem das receitas. Na ficha tecnica do cardapio voce calcula o custo de cada receita (CMV) e os outros custos do evento, como mao de obra, gas, energia etc. Para saber como utilizar a ficha tecnica do cardapio da melhor forma clique aqui. (Funcao para assinantes) <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/6_tutorial_cardapios.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/6_tutorial_cardapios.pdf">(saiba mais)</a>',
    enTitle: 'What is the technical sheet of a menu?',
    enAnswer:
      'When you are going to do an event, a dinner, a special menu, in addition to calculating the cost of each recipe, you must calculate the cost of the event as a whole, placing the other costs of the event in addition to the recipes. In the menu`s technical sheet you calculate the cost of each recipe (F&B Costs) and the other costs of the event, such as labor, gas, energy etc. To find out how to use the menu`s technical data in the best way, click here. (Subscriber role) <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/6_tutorial_cardapios.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/6_tutorial_cardapios.pdf">(know more)</a>',
  },
  {
    id: 7,
    title: 'O que e CMV?',
    answer:
      'Custo de mercadoria vendida. E o custo dos insumos, dos ingredientes, sem levar em conta os outros custos relacionados a operacao, como gas, energia, agua, mao de obra. Alguns consultores consideram custo de embalagem como CMV, outros definem que somente os ingredientes entram nessa calculo.',
    enTitle: 'What is F&B Costs?',
    enAnswer:
      'Cost of goods sold. It is the cost of inputs, ingredients, without taking into account the other costs related to the operation, such as gas, energy, water, labor. Some consultants consider packaging cost as F&B Costs, others define that only the ingredients are included in this calculation.',
  },
  {
    id: 8,
    title: 'Como gerar PDF da minha receita?',
    answer:
      'Ao criar a sua ficha tecnica, voce pode gerar o PDF com todas as informacoes ou somente com informacoes necessarias para a cozinha, para a gerencia ou para clientes. Clique nas opcoes da receita ou no final da ficha tecnica no botao de PDF e escolha quais informacoes irao aparecer no seu PDF. Clique em "Gerar" e sera feito o Download do PDF. (Funcao para assinantes)',
    enTitle: 'How to generate PDF of my revenue?',
    enAnswer:
      'When creating your technical file, you can generate the PDF with all the information or only with information needed for the kitchen, for management or for customers. Click on the recipe options or at the end of the technical sheet on the PDF button and choose what information will appear in your PDF. Click on "Generate" and the PDF will be downloaded. (Subscriber role)',
  },
  {
    id: 9,
    title: 'Como calcular as informacoes nutricionais da receita?',
    answer:
      'Ao adicionar cada ingrediente na receita, voce tera a opcao de informar a informacao <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/7_tutorial_info_nutri.m.pdf">(saiba mais)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/7_tutorial_info_nutri.pdf">(saiba mais)</a>',
    enTitle: 'How to calculate the nutrition facts of the recipe?',
    enAnswer:
      'When adding each ingredient to the recipe, you will have the option to enter the information <br /> <a class="d-sm-none" target="_blank" href="./assets/pdf/7_tutorial_info_nutri.m.pdf">(know more)</a> <a class="d-sm-inline d-none" target="_blank" href="./assets/pdf/7_tutorial_info_nutri.pdf">(know more)</a>',
  },
  {
    id: 10,
    title: 'Como gerar um rotulo nutricional?',
    answer:
      'Em cada receita, clique no botao "Gerar rotulo" na aba de Informacoes Nutricionais, e sera feito o Download de arquivo em PDF somente do rotulo. Voce pode tambem gerar o PDF da receita completa e tera o rotulo nutricional junto com as outras informacoes da receita.',
    enTitle: 'How to generate a nutrition label?',
    enAnswer:
      'For each recipe, click on the "Generate label" button in the Nutrition Facts tab, and the PDF file will be downloaded only for the label. You can also generate the PDF of the complete recipe and you will have the nutrition label along with the other recipe information.',
  },
  {
    id: 11,
    title: 'Sobre seguranca e privacidade dos dados?',
    answer:
      'Os seus dados estarao protegidos e nao serao compartilhados em nenhuma circustancia exato quando voce compartilhar um receita com outro usuario especifico. Trabalhamos constantemente para manter a seguranca. A sua senha e criptografada. Mas lembre de nao compartilhar sua senha com ninguem. ',
    enTitle: 'About data security and privacy?',
    enAnswer:
      'Your data will be protected and will not be shared under any circumstances when you share a recipe with another specific user. We are constantly working to maintain security. Your password is encrypted. But remember not to share your password with anyone. ',
  },
  {
    id: 12,
    title: 'Como criar um novo ingrediente?',
    answer:
      'Na tela de Ingrediente, clique no botao laranja “Criar novo”. Adicione o nome, categoria e as outras informacoes. Voce pode tambem criar um ingrediente no momento de adicionar dentro da receita, voce escreve no buscador, e se nao tiver o ingrediente com essa nome, tera a opcao de criar novo no final das opcoes do buscador.',
    enTitle: 'How to create a new ingredient?',
    enAnswer:
      'In the Ingredient screen, click on the orange “Create new” button. Add the name, category and other information. You can also create an ingredient when adding it to the recipe, you write it in the search engine, and if you don`t have the ingredient with that name, you will have the option to create a new one at the end of the search engine options.',
  },
  {
    id: 13,
    title: 'Como adicionar ingredientes na receita?',
    answer:
      'Dentro da receita, na aba de ingredientes, digite o nome do ingrediente no buscador e clique nele para adicionar. Se nao houver o ingrediente com o nome da sua busca, basta criar um novo na opcao de “criar novo” no proprio buscador.',
    enTitle: 'How to add ingredients to the recipe?',
    enAnswer:
      'Inside the recipe, in the ingredients tab, type the name of the ingredient in the search engine and click on it to add. If there is no ingredient with the name of your search, just create a new one in the "create new" option in the search engine itself.',
  },
  {
    id: 14,
    title: 'Como preencher as informacoes do ingrediente na receita?',
    answer:
      'Apos adicionar, clique no ingrediente e abrir a tela de informacoes. Preencha a quantidade utilizada na receita e a unidade de medida. Depois informe o preco do ingrediente e a unidade de medida relacionada ao preco. Ex. R$2 por 1kg. Se o ingrediente tiver perdas, informe no fator de correcao o peso bruto (antes das perdas) e o peso limpo, ou apenas informa o FC no campo de peso bruto e deixa o peso limpo = 1',
    enTitle: 'How to fill the ingredient information in the recipe?',
    enAnswer:
      'After adding, click on the ingredient and open the information screen. Fill in the quantity used in the recipe and the unit of measure. Then enter the price of the ingredient and the unit of measure related to the price. Ex. R $ 2 per 1kg. If the ingredient has losses, inform in the correction factor the gross weight (before the losses) and the clean weight, or just inform the FC in the gross weight field and leave the clean weight = 1',
  },
  {
    id: 15,
    title: 'Como alterar os precos dos ingredientes?',
    answer:
      'Voce pode alterar o preco do ingrediente dentro da receita, clicando no ingrediente. Ou pode ir na pagina de ingredientes e alterar por la. Lembre-se que ao alterar o valor do ingrediente, ira alterar em todas as receitas que tem aquele ingrediente.',
    enTitle: 'How to change ingredient prices?',
    enAnswer:
      'You can change the price of the ingredient within the recipe by clicking on the ingredient. Or you can go to the ingredients page and change there. Remember that when you change the value of the ingredient, it will change in all recipes that have that ingredient.',
  },
  {
    id: 16,
    title: 'Como excluir ingredientes?',
    answer:
      'Voce pode excluir o ingrediente de uma receita clicando nele e no botao com icone de lixeira. Tambem pode excluir permanentemente de toda a lista os ingrediente que voce criou, os que ja vem na lista nao podem ser excluidos. Lembre-se que quando exclui um ingrediente da lista, ele sera excluido de todas as receitas que tem aquele ingrediente.',
    enTitle: 'How to exclude ingredients?',
    enAnswer:
      'You can delete the ingredient from a recipe by clicking on it and the button with the trash icon. You can also permanently exclude the ingredients you have created from the entire list, those already on the list cannot be excluded. Remember that when you exclude an ingredient from the list, it will be excluded from all recipes that have that ingredient.',
  },
  {
    id: 17,
    title: 'Como excluir receitas?',
    answer:
      'Clique no icone de opcoes das receitas e "Deletar" ou dentro da receita, no final tem o botao de Excluir.',
    enTitle: 'How to delete recipes?',
    enAnswer:
      'Click on the recipe options icon and "Delete" or inside the recipe, at the end you have the Delete button.',
  },
  {
    id: 18,
    title: 'Como duplicar receitas?',
    answer:
      'Clique no icone de opcoes das receitas e em “Duplicar receita”. Sua receita sera duplicada com as mesmas informacoes da original.',
    enTitle: 'How to duplicate recipes?',
    enAnswer:
      'Click on the recipe options icon and click on “Duplicate recipe”. Your revenue will be doubled with the same information as the original.',
  },
  {
    id: 19,
    title: 'Como compartilhar receitas?',
    answer:
      'Clique no icone de opcoes das receitas e em “Compartilhar”, depois informe o e-mail da pessoa que voce ira receber a receita na plataforma dela. Lembre-se que o e-mail deve ter cadastro no chefpro para a pessoa poder acessar.',
    enTitle: 'How to share recipes?',
    enAnswer:
      'Click on the recipe options icon and on “Share”, then enter the email of the person that you will receive the recipe on their platform. Remember that the email must be registered with chefpro for the person to access it.',
  },
  {
    id: 20,
    title: 'O chefpro e pago?',
    answer:
      'O chefpro tem 3 planos de assinaturas. Porem as fichas tecnicas sao gratuitas (6 com fotos e o restante sem fotos).',
    enTitle: 'Is chefpro paid?',
    enAnswer:
      'Chefpro has 3 subscription plans. However, the technical files are free (6 with photos and the rest without photos).',
  },
  {
    id: 21,
    title: 'Como alterar a moeda?',
    answer:
      'Clique na foto do perfil no canto superior direito, depois em Meu perfil. Na opcao de Moeda escolha quem formato de moeda ira aparecer no aplicativo e no PDF.',
    enTitle: 'How to change the currency?',
    enAnswer:
      'Click on the profile photo in the upper right corner, then on My Profile. In the Currency option choose which currency format will appear in the application and in the PDF.',
  },
  {
    id: 22,
    title: 'Como alterar senha?',
    answer:
      'Clique na foto do perfil no canto superior direito, depois em Meu perfil. Na opcao de Alterar senha preencha uma nova senha, confirma a senha no campo de baixo. Depois informe sua senha atual para confirmar a alteracao. Se voce esqueceu a senha, pode fazer Logout e cliquem em Esqueci minha senha, que sera enviado um link para o seu email de cadastro para criar uma nova senha.',
    enTitle: 'How to change password?',
    enAnswer:
      'Click on the profile photo in the upper right corner, then on My Profile. In the Change password option fill in a new password, confirm the password in the field below. Then enter your current password to confirm the change. If you have forgotten your password, you can log out and click on I forgot my password, a link will be sent to your registration email to create a new password.',
  },
  {
    id: 23,
    title: 'Como alterar foto do perfil?',
    answer:
      'Clique na foto do perfil no canto superior direito, depois em Meu perfil. Clique na foto e escolha uma imagem para o seu perfil.',
    enTitle: 'How to change profile picture?',
    enAnswer:
      'Click on the profile photo in the upper right corner, then on My Profile. Click on the photo and choose an image for your profile.',
  },
];

const subjectOptions = [
  'Duvidas',
  'Problemas',
  'Sugestoes',
  'Financeiro',
  'Conta',
];

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const notification = useNotification();

  const [tab, setTab] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | false>(false);

  const isEnglish = i18n.language?.startsWith('en');

  const faqList = useMemo(() => {
    return faqItems.map((item) => ({
      ...item,
      displayTitle: isEnglish ? item.enTitle || item.title : item.title,
      displayAnswer: isEnglish ? item.enAnswer || item.answer : item.answer,
    }));
  }, [isEnglish]);

  const filteredFaq = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return faqList;
    }
    return faqList.filter((item) => item.displayTitle.toLowerCase().includes(normalized));
  }, [faqList, searchTerm]);

  const handleSubmit = () => {
    notification.showInfo('Funcionalidade de suporte em desenvolvimento.');
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: { xs: 1, sm: 2 },
          maxWidth: 820,
          mx: 'auto',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          <Tab label="Suporte" />
          <Tab label="Perguntas frequentes" />
        </Tabs>
        <Divider />

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ola!
                </Typography>
                <InfoOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Queremos ouvir voce! A sua opiniao e muito importante para a melhoria da
                plataforma e para prestarmos um servico cada vez melhor.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Entre em contato em caso de duvidas, problemas ou qualquer sugestao.
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel id="support-subject-label">Assunto</InputLabel>
                <Select
                  labelId="support-subject-label"
                  label="Assunto"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                >
                  {subjectOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Mensagem"
                multiline
                minRows={4}
                fullWidth
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Se precisar, voce pode anexar uma imagem ou video para ajudarmos voce da melhor
                forma.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFile />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Escolher arquivo
                  <input
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setAttachmentName(file ? file.name : '');
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {attachmentName || 'Nenhum arquivo escolhido'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  endIcon={<Send />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Enviar
                </Button>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Digite a palavra chave da sua duvida"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  },
                }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filteredFaq.map((item) => (
                  <Accordion
                    key={item.id}
                    expanded={expandedId === item.id}
                    onChange={() =>
                      setExpandedId((prev) => (prev === item.id ? false : item.id))
                    }
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}
                      sx={{
                        '& .MuiAccordionSummary-content': { margin: 0 },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.displayTitle}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: item.displayAnswer }}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default SupportPage;
