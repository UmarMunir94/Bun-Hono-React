import type { CardProps } from '@mui/material/Card';
import type { TableHeadCellProps } from 'src/components/table';

import { usePopover } from 'minimal-shared/hooks';

// import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  headCells: TableHeadCellProps[];
  tableData: {
    id: string;
    price: number;
    status: string;
    category: string;
    invoiceNumber: string;
  }[];
};

export function AppNewInvoices({ title, subheader, tableData, headCells, sx, ...other }: Props) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom headCells={headCells} />

          <TableBody>
            {tableData.map((row) => (
              <RowItem key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type RowItemProps = {
  row: Props['tableData'][number];
};

function RowItem({ row }: RowItemProps) {
  const theme = useTheme();
  const menuActions = usePopover();

  const handleDownload = () => {
    menuActions.onClose();
    console.info('DOWNLOAD', row.id);
  };

  const handlePrint = () => {
    menuActions.onClose();
    console.info('PRINT', row.id);
  };

  const handleShare = () => {
    menuActions.onClose();
    console.info('SHARE', row.id);
  };

  const handleDelete = () => {
    menuActions.onClose();
    console.info('DELETE', row.id);
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={handleDownload}>
          <Iconify icon="eva:cloud-download-fill" />
          Download
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon="solar:share-bold" />
          Share
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <TableRow>
        <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{row.invoiceNumber}</TableCell>

        <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{row.category}</TableCell>

        <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{fCurrency(row.price)}</TableCell>

        <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
          <Label
            sx={{
              ...(row.status === 'progress' && {
                bgcolor: theme.vars.palette.pastels.purple,
                color: '#1A1A1A',
              }),
              ...(row.status === 'out of date' && {
                bgcolor: theme.vars.palette.pastels.yellow,
                color: '#1A1A1A',
              }),
              ...(row.status === 'paid' && {
                bgcolor: theme.vars.palette.pastels.green,
                color: '#1A1A1A',
              }),
            }}
          >
            {row.status === 'progress' && 'In Progress'}
            {row.status === 'out of date' && 'Pending'}
            {row.status === 'paid' && 'Completed'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ pr: 1 }}>
          <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {renderMenuActions()}
    </>
  );
}
